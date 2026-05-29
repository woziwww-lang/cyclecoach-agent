import { prisma } from "@/lib/db/prisma";
import { refreshStravaToken, StravaTokenResponse } from "@/lib/strava/oauth";
import { StravaActivityDetail, StravaActivitySummary, StravaClient } from "@/lib/strava/client";
import { calculateRideMetrics } from "@/lib/fitness/metrics";

export async function upsertStravaConnection(token: StravaTokenResponse, userId: string) {
  const athleteName = [token.athlete.firstname, token.athlete.lastname].filter(Boolean).join(" ").trim();
  const providerUserId = String(token.athlete.id);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const account = await prisma.connectedAccount.upsert({
    where: { provider_providerUserId: { provider: "strava", providerUserId } },
    update: {
      userId: user.id,
      displayName: athleteName,
      status: "connected"
    },
    create: {
      userId: user.id,
      provider: "strava",
      providerUserId,
      displayName: athleteName,
      status: "connected"
    }
  });

  await prisma.oAuthToken.upsert({
    where: { connectedAccountId: account.id },
    update: {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: new Date(token.expires_at * 1000),
      tokenType: token.token_type
    },
    create: {
      connectedAccountId: account.id,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: new Date(token.expires_at * 1000),
      tokenType: token.token_type
    }
  });

  return { user, account };
}

export async function getValidStravaAccessToken(userId: string) {
  const account = await prisma.connectedAccount.findFirst({
    where: { userId, provider: "strava", status: "connected" },
    include: { token: true }
  });

  if (!account?.token) throw new Error("STRAVA_NOT_CONNECTED");
  const expiresAt = account.token.expiresAt?.getTime() ?? 0;

  if (expiresAt > Date.now() + 60_000) return account.token.accessToken;
  if (!account.token.refreshToken) throw new Error("STRAVA_REFRESH_TOKEN_MISSING");

  const refreshed = await refreshStravaToken(account.token.refreshToken);
  await prisma.oAuthToken.update({
    where: { connectedAccountId: account.id },
    data: {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      expiresAt: new Date(refreshed.expires_at * 1000),
      tokenType: refreshed.token_type
    }
  });

  return refreshed.access_token;
}

export async function syncRecentCyclingActivities(userId: string, accessToken: string) {
  const client = new StravaClient(accessToken);
  const allActivities = await client.listActivities(1, 30);
  const cyclingActivities = allActivities.filter(isCyclingActivity);

  for (const activity of cyclingActivities) {
    await prisma.stravaActivity.upsert({
      where: { userId_stravaId: { userId, stravaId: String(activity.id) } },
      update: mapStravaActivity(activity),
      create: {
        userId,
        stravaId: String(activity.id),
        ...mapStravaActivity(activity)
      }
    });
  }

  await prisma.connectedAccount.updateMany({
    where: { userId, provider: "strava" },
    data: { lastSyncedAt: new Date() }
  });

  return { fetched: allActivities.length, cycling: cyclingActivities.length };
}

export async function fetchAndCacheActivityDetailAndStreams(userId: string, activityId: string) {
  const activity = await prisma.stravaActivity.findFirst({ where: { id: activityId, userId } });
  if (!activity) throw new Error("ACTIVITY_NOT_FOUND");

  const accessToken = await getValidStravaAccessToken(userId);
  const client = new StravaClient(accessToken);
  const detail = await client.getActivity(activity.stravaId);

  let streams: Record<string, unknown> = {};
  try {
    streams = await client.getActivityStreams(activity.stravaId);
  } catch (error) {
    console.warn("Strava streams unavailable", error);
  }

  await prisma.stravaActivity.update({
    where: { id: activity.id },
    data: {
      ...mapStravaActivity(detail),
      rawDetailJson: JSON.stringify(detail),
      computedMetrics: JSON.stringify(calculateRideMetrics({
        distanceMeters: detail.distance,
        movingTimeSec: detail.moving_time,
        elevationGainMeters: detail.total_elevation_gain,
        avgHr: detail.average_heartrate,
        maxHr: detail.max_heartrate,
        avgWatts: detail.average_watts,
        weightedWatts: detail.weighted_average_watts
      }))
    },
    include: { stream: true }
  });

  if (Object.keys(streams).length > 0) {
    const latlngCount = getLatLngCount(streams);
    await prisma.stravaActivityStream.upsert({
      where: { activityId: activity.id },
      update: {
        streamsJson: JSON.stringify(streams),
        availableKeys: JSON.stringify(Object.keys(streams)),
        latlngCount
      },
      create: {
        activityId: activity.id,
        streamsJson: JSON.stringify(streams),
        availableKeys: JSON.stringify(Object.keys(streams)),
        latlngCount
      }
    });
  }

  return prisma.stravaActivity.findUniqueOrThrow({
    where: { id: activity.id },
    include: { stream: true, analyses: { orderBy: { createdAt: "desc" }, take: 1 } }
  });
}

function isCyclingActivity(activity: StravaActivitySummary) {
  const value = `${activity.type ?? ""} ${activity.sport_type ?? ""}`.toLowerCase();
  return value.includes("ride") || value.includes("cycling") || value.includes("bike");
}

function mapStravaActivity(activity: StravaActivitySummary | StravaActivityDetail) {
  return {
    name: activity.name,
    type: activity.type,
    sportType: activity.sport_type,
    startDate: new Date(activity.start_date),
    timezone: activity.timezone,
    distanceMeters: activity.distance,
    movingTimeSec: activity.moving_time,
    elapsedTimeSec: activity.elapsed_time,
    totalElevationGain: activity.total_elevation_gain,
    averageSpeed: activity.average_speed,
    maxSpeed: activity.max_speed,
    averageHeartrate: activity.average_heartrate,
    maxHeartrate: activity.max_heartrate,
    averageWatts: activity.average_watts,
    weightedAverageWatts: activity.weighted_average_watts,
    averageCadence: activity.average_cadence,
    calories: activity.calories,
    summaryPolyline: activity.map?.summary_polyline,
    rawSummaryJson: JSON.stringify(activity)
  };
}

function getLatLngCount(streams: Record<string, unknown>) {
  const latlng = streams.latlng as { data?: unknown[] } | undefined;
  return Array.isArray(latlng?.data) ? latlng.data.length : null;
}

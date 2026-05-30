import type { StravaActivity } from "@prisma/client";
import type { TrainingMemory } from "@/features/agent/schemas/training-memory.schema";
import { compactActivityMemory } from "@/features/agent/memory/compact-activity-memory";
import { extractRouteHistory } from "@/features/agent/tools/extract-route-history";

export function summarizeTrainingLoad(activities30d: StravaActivity[]): TrainingMemory {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const activities7d = activities30d.filter((activity) => activity.startDate.getTime() >= sevenDaysAgo);
  const latest = activities30d[0] ? compactActivityMemory(activities30d[0]) : null;
  const routeMemory = extractRouteHistory(activities30d).slice(0, 8).map((candidate) => ({
    activityId: candidate.basedOnActivityId ?? candidate.id,
    name: candidate.name,
    date: activities30d.find((activity) => activity.id === candidate.basedOnActivityId)?.startDate.toISOString() ?? new Date().toISOString(),
    distanceKm: candidate.distanceKm ?? 0,
    elevationM: candidate.elevationM ?? 0,
    movingTimeMinutes: candidate.durationMinutes ?? 0,
    avgHr: null,
    avgPower: null,
    routeType: candidate.routeType,
    hasPolyline: Boolean(candidate.polyline),
    polyline: candidate.polyline,
    effortSummary: candidate.notes
  }));

  const last7Days = summarizeWindow(activities7d, "7d");
  const last30Days = summarizeThirtyDays(activities30d);
  const missingData = buildMissingDataNotes(activities30d);
  const fatigueSignals = buildFatigueSignals(activities7d, last7Days);

  return {
    latestRide: latest,
    last7Days,
    last30Days,
    routeMemory,
    fatigueSignals,
    missingData
  };
}

function summarizeWindow(activities: StravaActivity[], label: "7d") {
  const totals = totalsFor(activities);
  return {
    rideCount: activities.length,
    distanceKm: totals.distanceKm,
    elevationM: totals.elevationM,
    movingTimeMinutes: totals.movingTimeMinutes,
    notableLoad: describeLoad(label, totals.distanceKm, totals.elevationM, totals.movingTimeMinutes, activities.length)
  };
}

function summarizeThirtyDays(activities: StravaActivity[]) {
  const totals = totalsFor(activities);
  const recent7 = totalsFor(activities.filter((activity) => activity.startDate.getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000));
  const averageWeeklyDistance = totals.distanceKm / Math.max(1, 30 / 7);
  const trend =
    activities.length === 0
      ? "No recent rides found."
      : recent7.distanceKm > averageWeeklyDistance * 1.35
        ? "Last 7 days are above your recent 30-day weekly average."
        : recent7.distanceKm < averageWeeklyDistance * 0.55
          ? "Last 7 days are lighter than your recent 30-day pattern."
          : "Last 7 days are broadly in line with your recent 30-day pattern.";

  return {
    rideCount: activities.length,
    distanceKm: totals.distanceKm,
    elevationM: totals.elevationM,
    movingTimeMinutes: totals.movingTimeMinutes,
    trendSummary: trend
  };
}

function totalsFor(activities: StravaActivity[]) {
  return {
    distanceKm: round(activities.reduce((sum, activity) => sum + (activity.distanceMeters ?? 0), 0) / 1000, 1),
    elevationM: Math.round(activities.reduce((sum, activity) => sum + (activity.totalElevationGain ?? 0), 0)),
    movingTimeMinutes: Math.round(activities.reduce((sum, activity) => sum + (activity.movingTimeSec ?? 0), 0) / 60)
  };
}

function describeLoad(label: "7d", distanceKm: number, elevationM: number, movingTimeMinutes: number, rideCount: number) {
  if (rideCount === 0) return `No rides in the last ${label}.`;
  const hours = movingTimeMinutes / 60;
  if (hours >= 8 || elevationM >= 1200) return "Training load looks meaningfully high; be careful stacking intensity.";
  if (distanceKm >= 150) return "Distance volume is substantial; endurance may be well covered this week.";
  if (rideCount <= 1) return "Low recent ride count; build gradually rather than forcing intensity.";
  return "Recent load looks moderate.";
}

function buildMissingDataNotes(activities: StravaActivity[]) {
  const notes: string[] = [];
  if (activities.length === 0) {
    return ["No recent Strava activities are available."];
  }
  if (!activities.some((activity) => activity.averageHeartrate || activity.maxHeartrate)) {
    notes.push("No recent heart-rate data found; intensity confidence is lower.");
  }
  if (!activities.some((activity) => activity.averageWatts || activity.weightedAverageWatts)) {
    notes.push("No recent power data found; power-zone conclusions are not available.");
  }
  if (!activities.some((activity) => activity.summaryPolyline)) {
    notes.push("No recent route polyline found; route recommendations cannot reuse a mapped activity.");
  }
  return notes;
}

function buildFatigueSignals(activities7d: StravaActivity[], summary: TrainingMemory["last7Days"]) {
  const signals: string[] = [];
  if (summary.movingTimeMinutes >= 8 * 60) signals.push("Last 7 days include 8+ hours of riding.");
  if (summary.elevationM >= 1200) signals.push("Last 7 days are climbing-heavy.");
  if (activities7d.some((activity) => (activity.averageHeartrate ?? 0) >= 155 || (activity.averageWatts ?? 0) >= 180)) {
    signals.push("Recent activities include possible high-intensity efforts.");
  }
  return signals;
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

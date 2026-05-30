import type { StravaActivity } from "@prisma/client";
import type { CompactActivityMemory, RouteType } from "@/features/agent/schemas/training-memory.schema";

export function compactActivityMemory(activity: StravaActivity): CompactActivityMemory {
  const distanceKm = round((activity.distanceMeters ?? 0) / 1000, 1);
  const elevationM = Math.round(activity.totalElevationGain ?? 0);
  const movingTimeMinutes = Math.round((activity.movingTimeSec ?? 0) / 60);
  const routeType = classifyRouteType(distanceKm, elevationM, movingTimeMinutes);

  return {
    activityId: activity.id,
    name: activity.name,
    date: activity.startDate.toISOString(),
    distanceKm,
    elevationM,
    movingTimeMinutes,
    avgHr: activity.averageHeartrate ?? null,
    avgPower: activity.averageWatts ?? activity.weightedAverageWatts ?? null,
    routeType,
    hasPolyline: Boolean(activity.summaryPolyline),
    polyline: activity.summaryPolyline ?? null,
    effortSummary: summarizeEffort(activity, routeType)
  };
}

export function classifyRouteType(distanceKm: number, elevationM: number, movingTimeMinutes = 0): RouteType {
  if (distanceKm <= 0) return "unknown";
  const elevationPerKm = elevationM / distanceKm;
  if (movingTimeMinutes <= 60 && elevationPerKm < 5) return "recovery";
  if (elevationPerKm < 5) return "flat";
  if (elevationPerKm < 15) return "rolling";
  if (elevationPerKm >= 15) return "climbing";
  return "unknown";
}

function summarizeEffort(activity: StravaActivity, routeType: RouteType) {
  const hr = activity.averageHeartrate;
  const watts = activity.averageWatts ?? activity.weightedAverageWatts;
  if (hr && hr >= 155) return `Likely higher intensity from average HR ${Math.round(hr)} bpm.`;
  if (watts && watts >= 180) return `Possibly higher intensity from average power ${Math.round(watts)} W.`;
  if (routeType === "climbing") return "Climbing-heavy route; effort depends on pacing.";
  if (routeType === "flat" || routeType === "recovery") return "Likely controllable route if ridden easy.";
  return "Effort unclear without heart-rate or power data.";
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

import type { StravaActivity } from "@prisma/client";
import type { RouteCandidate } from "@/features/agent/schemas/route-candidate.schema";
import { compactActivityMemory } from "@/features/agent/memory/compact-activity-memory";

export function extractRouteHistory(activities: StravaActivity[]): RouteCandidate[] {
  return activities
    .filter((activity) => (activity.distanceMeters ?? 0) > 0 && Boolean(activity.summaryPolyline))
    .map((activity) => {
      const memory = compactActivityMemory(activity);
      const difficulty = memory.routeType === "climbing" ? "hard" : memory.routeType === "rolling" ? "moderate" : "easy";
      return {
        id: `activity-${activity.id}`,
        name: activity.name,
        source: "previous_activity",
        provider: "strava_activity",
        region: activity.timezone ?? null,
        routeType: memory.routeType,
        distanceKm: memory.distanceKm,
        elevationM: memory.elevationM,
        durationMinutes: memory.movingTimeMinutes,
        difficulty,
        suitableGoals: inferSuitableGoals(memory.routeType),
        polyline: memory.polyline,
        mapPreviewAvailable: Boolean(memory.polyline),
        routeUrl: null,
        basedOnActivityId: activity.id,
        safetyNotes: ["Familiar route from your Strava history; still check current traffic, weather, and daylight."],
        notes: `Previous ride on ${new Date(activity.startDate).toLocaleDateString()}. ${memory.effortSummary}`,
        score: 0,
        scoreReasons: []
      } satisfies RouteCandidate;
    });
}

function inferSuitableGoals(routeType: RouteCandidate["routeType"]): RouteCandidate["suitableGoals"] {
  if (routeType === "climbing") return ["climbing", "long_ride"];
  if (routeType === "rolling") return ["endurance", "climbing", "ftp"];
  if (routeType === "recovery") return ["recovery", "endurance", "fat_loss"];
  if (routeType === "flat") return ["recovery", "endurance", "fat_loss", "long_ride"];
  return ["endurance"];
}

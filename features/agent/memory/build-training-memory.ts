import type { TrainingMemory } from "@/features/agent/schemas/training-memory.schema";
import { getRecentActivities } from "@/features/agent/tools/get-recent-activities";
import { summarizeTrainingLoad } from "@/features/agent/tools/summarize-training-load";

export async function buildTrainingMemory(userId: string): Promise<TrainingMemory> {
  const activities = await getRecentActivities(userId, 30, 80);
  return summarizeTrainingLoad(activities);
}

export function emptyTrainingMemory(): TrainingMemory {
  return {
    latestRide: null,
    last7Days: {
      rideCount: 0,
      distanceKm: 0,
      elevationM: 0,
      movingTimeMinutes: 0,
      notableLoad: "No recent rides found."
    },
    last30Days: {
      rideCount: 0,
      distanceKm: 0,
      elevationM: 0,
      movingTimeMinutes: 0,
      trendSummary: "No recent rides found."
    },
    routeMemory: [],
    fatigueSignals: [],
    missingData: ["No recent Strava activities are available."]
  };
}

import type { StravaActivity } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { getRouteCatalog } from "@/features/agent/data/route-catalog";
import { emptyTrainingMemory } from "@/features/agent/memory/build-training-memory";
import { generateDeterministicRidePlan } from "@/features/agent/tools/generate-deterministic-ride-plan";
import { matchRouteCandidates } from "@/features/agent/tools/match-route-candidates";
import { summarizeTrainingLoad } from "@/features/agent/tools/summarize-training-load";

describe("agent training memory and route planning", () => {
  it("summarizes recent load and detects route memory", () => {
    const memory = summarizeTrainingLoad([
      activity({ name: "Tamagawa morning ride", distanceMeters: 50000, elevation: 180, movingTime: 7200, polyline: "abc" }),
      activity({ name: "Hill day", distanceMeters: 60000, elevation: 1300, movingTime: 9000, avgHr: 158, polyline: "def" })
    ]);

    expect(memory.last7Days.rideCount).toBe(2);
    expect(memory.last7Days.distanceKm).toBe(110);
    expect(memory.routeMemory).toHaveLength(2);
    expect(memory.fatigueSignals.length).toBeGreaterThan(0);
  });

  it("prefers a familiar flat previous route for endurance", () => {
    const memory = summarizeTrainingLoad([
      activity({ name: "Tamagawa endurance route", distanceMeters: 65000, elevation: 120, movingTime: 8400, polyline: "abc" })
    ]);
    const candidates = matchRouteCandidates(
      { durationMinutes: 120, goal: "endurance", readiness: "normal", routePreference: "previous_route", useLatestRideContext: true },
      memory,
      memory.routeMemory.map((route) => ({
        id: route.activityId,
        name: route.name,
        source: "previous_activity",
        region: null,
        routeType: route.routeType,
        distanceKm: route.distanceKm,
        elevationM: route.elevationM,
        durationMinutes: route.movingTimeMinutes,
        difficulty: "easy",
        suitableGoals: ["endurance", "recovery"],
        polyline: route.polyline,
        basedOnActivityId: route.activityId,
        safetyNotes: [],
        notes: route.effortSummary,
        score: 0,
        scoreReasons: []
      })),
      getRouteCatalog()
    );

    expect(candidates[0].source).toBe("previous_activity");
    expect(candidates[0].name).toContain("Tamagawa");
  });

  it("turns tired climbing requests into recovery-first plans", () => {
    const memory = emptyTrainingMemory();
    const candidates = matchRouteCandidates(
      { durationMinutes: 120, goal: "climbing", readiness: "tired", routePreference: "climbing", useLatestRideContext: false },
      memory,
      [],
      getRouteCatalog()
    );
    const plan = generateDeterministicRidePlan(
      { durationMinutes: 120, goal: "climbing", readiness: "tired", routePreference: "climbing", useLatestRideContext: false },
      memory,
      candidates
    );

    expect(plan.trainingPurpose).toBe("recovery");
    expect(plan.intensity).toBe("easy");
    expect(plan.avoidToday.join(" ")).toMatch(/hard intervals|sprinting|climbing/i);
  });
});

function activity(input: {
  name: string;
  distanceMeters: number;
  elevation: number;
  movingTime: number;
  avgHr?: number;
  polyline?: string;
}): StravaActivity {
  return {
    id: input.name.toLowerCase().replaceAll(" ", "-"),
    userId: "user-1",
    stravaId: input.name,
    name: input.name,
    type: "Ride",
    sportType: "Ride",
    startDate: new Date(),
    timezone: "Asia/Tokyo",
    distanceMeters: input.distanceMeters,
    movingTimeSec: input.movingTime,
    elapsedTimeSec: input.movingTime,
    totalElevationGain: input.elevation,
    averageSpeed: null,
    maxSpeed: null,
    averageHeartrate: input.avgHr ?? null,
    maxHeartrate: null,
    averageWatts: null,
    weightedAverageWatts: null,
    averageCadence: null,
    calories: null,
    summaryPolyline: input.polyline ?? null,
    rawSummaryJson: null,
    rawDetailJson: null,
    computedMetrics: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

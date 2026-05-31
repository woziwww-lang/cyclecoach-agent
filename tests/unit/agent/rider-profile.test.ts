import type { StravaActivity } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { buildRiderProfile } from "@/features/analytics/services/rider-profile-service";

describe("rider profile analyzer", () => {
  it("returns low confidence when data is insufficient", () => {
    const profile = buildRiderProfile([activity("short", 20, 80, 3600)]);
    expect(profile.riderType).toBe("unknown");
    expect(profile.confidence).toBe("low");
  });

  it("detects climbing-oriented patterns", () => {
    const profile = buildRiderProfile([
      activity("hill 1", 45, 900, 7200),
      activity("hill 2", 55, 1100, 8400),
      activity("hill 3", 60, 1200, 9000),
      activity("rolling", 40, 600, 6000)
    ]);
    expect(["climber", "rouleur", "punchy"]).toContain(profile.riderType);
    expect(profile.scores.climbing).toBeGreaterThan(60);
  });
});

function activity(name: string, km: number, elevationM: number, movingSec: number): StravaActivity {
  return {
    id: name,
    userId: "user-1",
    stravaId: name,
    name,
    type: "Ride",
    sportType: "Ride",
    startDate: new Date(),
    timezone: "Asia/Tokyo",
    distanceMeters: km * 1000,
    movingTimeSec: movingSec,
    elapsedTimeSec: movingSec,
    totalElevationGain: elevationM,
    averageSpeed: null,
    maxSpeed: null,
    averageHeartrate: null,
    maxHeartrate: null,
    averageWatts: null,
    weightedAverageWatts: null,
    averageCadence: null,
    calories: null,
    summaryPolyline: null,
    rawSummaryJson: null,
    rawDetailJson: null,
    computedMetrics: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

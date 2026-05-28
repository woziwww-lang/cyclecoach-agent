import { describe, expect, it } from "vitest";
import { calculateRideMetrics, classifyEffort } from "@/lib/fitness/metrics";

describe("ride metrics", () => {
  it("classifies endurance from heart-rate intensity", () => {
    const result = calculateRideMetrics({
      distanceMeters: 50000,
      movingTimeSec: 7200,
      elevationGainMeters: 500,
      avgHr: 130,
      maxHr: 180
    });

    expect(result.classification).toBe("endurance");
    expect(result.confidence).toBe(0.6);
  });

  it("classifies climbing-heavy rides", () => {
    expect(classifyEffort(0.8, 20)).toBe("climbing");
  });

  it("does not invent intensity without HR or power", () => {
    const result = calculateRideMetrics({
      distanceMeters: 30000,
      movingTimeSec: 3600,
      elevationGainMeters: 100
    });

    expect(result.intensity).toBeNull();
    expect(result.classification).toBe("unknown");
    expect(result.confidence).toBe(0.35);
  });
});

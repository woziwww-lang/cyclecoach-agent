import { describe, expect, it } from "vitest";
import { emptyTrainingMemory } from "@/features/agent/memory/build-training-memory";
import type { RidePlanInput } from "@/features/agent/schemas/ride-plan.schema";
import type { RouteCandidate } from "@/features/agent/schemas/route-candidate.schema";
import { scoreRouteCandidate } from "@/features/routes/services/route-scoring-service";

const input: RidePlanInput = {
  durationMinutes: 90,
  goal: "endurance",
  readiness: "normal",
  routePreference: "riverside",
  startLocation: { type: "unknown", label: null, lat: null, lng: null },
  weatherAware: false,
  useLatestRideContext: false
};

describe("route scoring", () => {
  it("rewards route preference and goal fit", () => {
    const scored = scoreRouteCandidate(candidate({ name: "Tamagawa Endurance Course", suitableGoals: ["endurance"] }), input, emptyTrainingMemory());
    expect(scored.score).toBeGreaterThan(50);
    expect(scored.scoreReasons.join(" ")).toMatch(/riverside|endurance/i);
  });

  it("penalizes hard climbing when tired", () => {
    const fresh = scoreRouteCandidate(
      candidate({ name: "Tomin no Mori", routeType: "climbing", difficulty: "hard", suitableGoals: ["climbing"] }),
      { ...input, goal: "climbing", routePreference: "climbing", readiness: "fresh" },
      emptyTrainingMemory()
    );
    const tired = scoreRouteCandidate(
      candidate({ name: "Tomin no Mori", routeType: "climbing", difficulty: "hard", suitableGoals: ["climbing"] }),
      { ...input, goal: "climbing", routePreference: "climbing", readiness: "tired" },
      emptyTrainingMemory()
    );
    expect(tired.score).toBeLessThan(fresh.score);
    expect(tired.scoreReasons.join(" ")).toMatch(/fatigue|hard climbing/i);
  });
});

function candidate(patch: Partial<RouteCandidate>): RouteCandidate {
  return {
    id: "route-1",
    name: "Route",
    source: "route_catalog",
    provider: "catalog",
    region: "Tokyo",
    routeType: "flat",
    distanceKm: 50,
    elevationM: 120,
    durationMinutes: 90,
    difficulty: "easy",
    suitableGoals: ["endurance"],
    polyline: null,
    mapPreviewAvailable: false,
    routeUrl: null,
    basedOnActivityId: null,
    safetyNotes: [],
    notes: "test route",
    score: 0,
    scoreReasons: [],
    ...patch
  };
}

import type { RouteProvider } from "@/features/routes/providers/route-provider.types";

export const fallbackRouteProvider: RouteProvider = {
  id: "fallback",
  name: "Manual fallback",
  async isAvailable() {
    return true;
  },
  async findCandidates(input) {
    const tired = input.planInput.readiness === "tired" || input.trainingMemory.fatigueSignals.length > 0;
    return [
      {
        id: "manual-fallback",
        name: tired ? "Short familiar recovery loop" : "Familiar low-risk local route",
        source: "manual_fallback",
        provider: "fallback",
        region: input.planInput.startLocation.label,
        routeType: tired ? "recovery" : input.planInput.goal === "climbing" ? "rolling" : "endurance",
        distanceKm: null,
        elevationM: null,
        durationMinutes: tired ? Math.min(input.planInput.durationMinutes, 60) : input.planInput.durationMinutes,
        difficulty: tired ? "easy" : "unknown",
        suitableGoals: [input.planInput.goal],
        polyline: null,
        mapPreviewAvailable: false,
        routeUrl: null,
        basedOnActivityId: null,
        safetyNotes: ["Use a route you already know and can shorten if conditions or legs feel worse."],
        notes: "No external route, history route, or catalog match was suitable, so this stays conservative.",
        score: 1,
        scoreReasons: ["manual fallback due to missing or unavailable route data"]
      }
    ];
  }
};

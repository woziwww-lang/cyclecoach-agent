import type { RouteProvider } from "@/features/routes/providers/route-provider.types";

export const previousActivityRouteProvider: RouteProvider = {
  id: "strava_activity",
  name: "Previous Strava activities",
  async isAvailable(input) {
    return input.recentRouteCandidates.length > 0;
  },
  async findCandidates(input) {
    return input.recentRouteCandidates.map((candidate) => ({
      ...candidate,
      provider: "strava_activity",
      mapPreviewAvailable: Boolean(candidate.polyline),
      routeUrl: null
    }));
  }
};

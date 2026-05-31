import type { RouteProvider } from "@/features/routes/providers/route-provider.types";

export const stravaRouteProvider: RouteProvider = {
  id: "strava_routes",
  name: "Strava routes",
  async isAvailable() {
    return false;
  },
  async findCandidates() {
    return [];
  }
};

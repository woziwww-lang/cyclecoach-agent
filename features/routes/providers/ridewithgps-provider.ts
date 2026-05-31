import type { RouteProvider } from "@/features/routes/providers/route-provider.types";

export const rideWithGpsProvider: RouteProvider = {
  id: "ridewithgps",
  name: "Ride with GPS",
  async isAvailable() {
    return false;
  },
  async findCandidates() {
    return [];
  }
};

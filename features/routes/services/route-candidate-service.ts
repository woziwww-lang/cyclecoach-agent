import { extractRouteHistory } from "@/features/agent/tools/extract-route-history";
import { getRecentActivities } from "@/features/agent/tools/get-recent-activities";
import type { RidePlanInput } from "@/features/agent/schemas/ride-plan.schema";
import type { RouteCandidate } from "@/features/agent/schemas/route-candidate.schema";
import type { TrainingMemory } from "@/features/agent/schemas/training-memory.schema";
import { fallbackRouteProvider } from "@/features/routes/providers/fallback-route-provider";
import { openRouteServiceProvider } from "@/features/routes/providers/openrouteservice-provider";
import { previousActivityRouteProvider } from "@/features/routes/providers/previous-activity-route-provider";
import { routeCatalogProvider } from "@/features/routes/providers/route-catalog-provider";
import type { RouteProvider, RouteProviderContext } from "@/features/routes/providers/route-provider.types";
import { scoreRouteCandidate } from "@/features/routes/services/route-scoring-service";

const providers: RouteProvider[] = [
  previousActivityRouteProvider,
  openRouteServiceProvider,
  routeCatalogProvider,
  fallbackRouteProvider
];

export async function getRouteCandidates(input: RidePlanInput, memory: TrainingMemory, userId?: string | null) {
  const recentActivities = userId && input.useLatestRideContext ? await getRecentActivities(userId, 30, 80) : [];
  const recentRouteCandidates = extractRouteHistory(recentActivities).map((candidate) => ({
    ...candidate,
    provider: "strava_activity" as const,
    mapPreviewAvailable: Boolean(candidate.polyline),
    routeUrl: null
  }));

  const context: RouteProviderContext = {
    orsApiKey: process.env.ORS_API_KEY,
    enableExternalRouteSearch: process.env.ENABLE_EXTERNAL_ROUTE_SEARCH !== "false"
  };

  const found: RouteCandidate[] = [];
  for (const provider of providers) {
    try {
      if (await provider.isAvailable({ userId, planInput: input, trainingMemory: memory, recentRouteCandidates }, context)) {
        found.push(...await provider.findCandidates({ userId, planInput: input, trainingMemory: memory, recentRouteCandidates }, context));
      }
    } catch {
      // A route provider failure should never block planning.
    }
  }

  const unique = dedupeCandidates(found);
  return unique
    .map((candidate) => scoreRouteCandidate(candidate, input, memory))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

export async function getCatalogRouteCandidates() {
  return routeCatalogProvider.findCandidates(
    {
      planInput: {
        durationMinutes: 90,
        goal: "endurance",
        readiness: "normal",
        routePreference: "catalog_route",
        startLocation: { type: "unknown", label: null, lat: null, lng: null },
        weatherAware: false,
        useLatestRideContext: false
      },
      trainingMemory: {
        latestRide: null,
        last7Days: { rideCount: 0, distanceKm: 0, elevationM: 0, movingTimeMinutes: 0, notableLoad: "" },
        last30Days: { rideCount: 0, distanceKm: 0, elevationM: 0, movingTimeMinutes: 0, trendSummary: "" },
        routeMemory: [],
        fatigueSignals: [],
        missingData: []
      },
      recentRouteCandidates: []
    },
    { enableExternalRouteSearch: false }
  );
}

function dedupeCandidates(candidates: RouteCandidate[]) {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = `${candidate.provider}:${candidate.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

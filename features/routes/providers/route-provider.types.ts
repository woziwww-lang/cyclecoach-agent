import type { RidePlanInput } from "@/features/agent/schemas/ride-plan.schema";
import type { RouteCandidate } from "@/features/agent/schemas/route-candidate.schema";
import type { TrainingMemory } from "@/features/agent/schemas/training-memory.schema";

export type RouteCandidateInput = {
  userId?: string | null;
  planInput: RidePlanInput;
  trainingMemory: TrainingMemory;
  recentRouteCandidates: RouteCandidate[];
};

export type RouteProviderContext = {
  orsApiKey?: string;
  enableExternalRouteSearch: boolean;
};

export interface RouteProvider {
  id: string;
  name: string;
  isAvailable(input: RouteCandidateInput, context: RouteProviderContext): Promise<boolean>;
  findCandidates(input: RouteCandidateInput, context: RouteProviderContext): Promise<RouteCandidate[]>;
}

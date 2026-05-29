import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";
import type { RecentTrainingSummary, RidePlan, RidePlanInput } from "@/features/planner/schemas/ride-plan.schema";

export type GenerateRidePlanResponse = {
  plan: RidePlan;
  recentTraining: RecentTrainingSummary;
  model: string | null;
  fallbackUsed: boolean;
};

export function useGenerateRidePlanMutation() {
  return useMutation({
    mutationFn: (input: RidePlanInput) => apiPost<GenerateRidePlanResponse>("/api/planner/generate", input)
  });
}

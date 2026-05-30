import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";
import type { PlannerAgentResponse, RidePlanInput } from "@/features/planner/schemas/ride-plan.schema";

export type GenerateRidePlanResponse = PlannerAgentResponse;

export function useGenerateRidePlanMutation() {
  return useMutation({
    mutationFn: (input: RidePlanInput) => apiPost<GenerateRidePlanResponse>("/api/planner/generate", input)
  });
}

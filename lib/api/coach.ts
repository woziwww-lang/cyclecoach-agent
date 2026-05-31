import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";

export type CoachChatRequest = {
  message: string;
  activityId?: string | null;
};

export type CoachChatResponse = {
  message: string;
  structured?: {
    directAnswer: string;
    basedOnRecentRides: string[];
    recommendation: string[];
    why: string[];
    whatToWatch: string[];
    nextAction: string;
    confidence: { level: "high" | "medium" | "low"; reason: string };
    missingData: string[];
    disclaimer: string;
  };
  fallbackUsed: boolean;
  model: string;
  memoryUsed: boolean;
};

export function useCoachChatMutation() {
  return useMutation({
    mutationFn: (input: CoachChatRequest) => apiPost<CoachChatResponse>("/api/coach/chat", input)
  });
}

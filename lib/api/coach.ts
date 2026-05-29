import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";

export type CoachChatRequest = {
  message: string;
  activityId?: string | null;
};

export type CoachChatResponse = {
  message: string;
  fallbackUsed: boolean;
  model: string;
};

export function useCoachChatMutation() {
  return useMutation({
    mutationFn: (input: CoachChatRequest) => apiPost<CoachChatResponse>("/api/coach/chat", input)
  });
}

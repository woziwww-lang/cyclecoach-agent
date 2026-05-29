import type { UserSettings } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => apiGet<{ settings: UserSettings }>("/api/settings")
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<UserSettings>) => apiPatch<{ settings: UserSettings }>("/api/settings", input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      void queryClient.invalidateQueries({ queryKey: queryKeys.llmHealth });
    }
  });
}

export function useLlmHealthQuery() {
  return useQuery({
    queryKey: queryKeys.llmHealth,
    queryFn: () => apiGet<{ ok: boolean; ollama: { ok: boolean; model?: string; error?: string; missingModel?: boolean } }>("/api/llm/health"),
    refetchInterval: 60_000
  });
}

import type { ActivityAnalysis, StravaActivity, StravaActivityStream } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export type ActivityWithStream = StravaActivity & {
  stream: StravaActivityStream | null;
  analyses?: ActivityAnalysis[];
};

export function useActivitiesQuery() {
  return useQuery({
    queryKey: queryKeys.activities,
    queryFn: () => apiGet<{ activities: StravaActivity[] }>("/api/strava/activities")
  });
}

export function useActivityQuery(activityId?: string | null) {
  return useQuery({
    queryKey: queryKeys.activity(activityId ?? "none"),
    queryFn: () => apiGet<{ activity: ActivityWithStream }>(`/api/strava/activities/${activityId}`),
    enabled: Boolean(activityId)
  });
}

export function useActivityAnalysisQuery(activityId?: string | null) {
  return useQuery({
    queryKey: queryKeys.analysis(activityId ?? "none"),
    queryFn: () => apiGet<{ analysis: ActivityAnalysis | null }>(`/api/activities/${activityId}/analysis`),
    enabled: Boolean(activityId)
  });
}

export function useSyncStravaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<{ ok: true; result: unknown }>("/api/strava/sync"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activities });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stravaStatus });
    }
  });
}

export function useAnalyzeActivityMutation(activityId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<{ analysis: ActivityAnalysis }>(`/api/activities/${activityId}/analyze`),
    onSuccess: () => {
      if (!activityId) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.analysis(activityId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity(activityId) });
    }
  });
}

export function useRefreshActivityMutation(activityId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<{ activity: ActivityWithStream }>(`/api/strava/activities/${activityId}`, { redirect: false }),
    onSuccess: () => {
      if (!activityId) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity(activityId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activities });
    }
  });
}

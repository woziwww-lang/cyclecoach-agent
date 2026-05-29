"use client";

import type { ActivityAnalysis } from "@prisma/client";
import { ActivityMap } from "@/components/map/activity-map";
import { ActivityMetricCards } from "@/components/activity/activity-metric-cards";
import { AnalysisPanel } from "@/components/activity/analysis-panel";
import { StreamSummary } from "@/components/charts/stream-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingCard } from "@/components/ui/loading-card";
import { useActivityQuery, useRefreshActivityMutation } from "@/lib/api/activities";

export function ActivityDetailPanel({ activityId }: { activityId: string | null }) {
  const activityQuery = useActivityQuery(activityId);
  const refreshMutation = useRefreshActivityMutation(activityId);

  if (!activityId) {
    return <EmptyState title="Choose a ride" description="Select a Strava cycling activity to inspect the route, streams, metrics, and AI coach analysis." />;
  }

  if (activityQuery.isLoading) {
    return (
      <div className="grid gap-4">
        <LoadingCard label="Loading activity detail" />
        <LoadingCard label="Loading map" />
      </div>
    );
  }

  if (activityQuery.isError || !activityQuery.data?.activity) {
    return <EmptyState title="Activity unavailable" description={activityQuery.error?.message ?? "Could not load this activity. Try syncing Strava again."} />;
  }

  const activity = activityQuery.data.activity;
  const latestAnalysis = (activity.analyses?.[0] ?? null) as ActivityAnalysis | null;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-brand">Selected ride</p>
            <h2 className="mt-1 text-2xl font-semibold">{activity.name}</h2>
            <p className="mt-1 text-sm text-muted">{new Date(activity.startDate).toLocaleString()}</p>
          </div>
          <button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {refreshMutation.isPending ? "Refreshing…" : "Refresh detail & streams"}
          </button>
        </div>
      </div>
      {refreshMutation.isError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{refreshMutation.error.message}</div> : null}
      <ActivityMetricCards activity={activity} />
      <ActivityMap polyline={activity.summaryPolyline} stream={activity.stream} title="Ride route" />
      <StreamSummary stream={activity.stream} />
      <AnalysisPanel activityId={activity.id} latestAnalysis={latestAnalysis} />
    </div>
  );
}

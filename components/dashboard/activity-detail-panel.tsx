"use client";

import type { ActivityAnalysis } from "@prisma/client";
import { ActivityMap } from "@/components/map/activity-map";
import { ActivityMetricCards } from "@/components/activity/activity-metric-cards";
import { AnalysisPanel } from "@/components/activity/analysis-panel";
import { StreamSummary } from "@/components/charts/stream-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingCard } from "@/components/ui/loading-card";
import { Button } from "@/components/ui/button";
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
    return <ErrorState title="Activity unavailable" description={activityQuery.error?.message ?? "Could not load this activity. Try syncing Strava again."} onRetry={() => void activityQuery.refetch()} />;
  }

  const activity = activityQuery.data.activity;
  const latestAnalysis = (activity.analyses?.[0] ?? null) as ActivityAnalysis | null;

  return (
    <section className="space-y-4">
      <div className="cc-card px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="cc-section-label">Selected ride</p>
            <h2 className="mt-1 truncate text-xl font-semibold md:text-2xl">{activity.name}</h2>
            <p className="mt-1 text-sm text-muted">{new Date(activity.startDate).toLocaleString()}</p>
          </div>
          <Button
            tone="secondary"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending ? "Refreshing…" : "Refresh streams"}
          </Button>
        </div>
      </div>
      {refreshMutation.isError ? <ErrorState title="Refresh failed" description={refreshMutation.error.message} actionLabel="Try again" onRetry={() => refreshMutation.mutate()} /> : null}
      <ActivityMetricCards activity={activity} />
      <ActivityMap polyline={activity.summaryPolyline} stream={activity.stream} title="Ride route" />
      <StreamSummary stream={activity.stream} />
      <AnalysisPanel activityId={activity.id} latestAnalysis={latestAnalysis} />
    </section>
  );
}

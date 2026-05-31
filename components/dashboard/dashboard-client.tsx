"use client";

import { useEffect, useMemo } from "react";
import { ActivityDetailPanel } from "@/components/dashboard/activity-detail-panel";
import { ActivityListPanel } from "@/components/dashboard/activity-list-panel";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingCard } from "@/components/ui/loading-card";
import { useActivitiesQuery, useSyncStravaMutation } from "@/lib/api/activities";
import { useStravaStatusQuery } from "@/lib/api/strava";
import { useDashboardStore } from "@/lib/stores/use-dashboard-store";
import { DashboardIcon } from "@/components/ui/icons";
import { DashboardAnalyticsPanel } from "@/features/analytics/components/dashboard-analytics-panel";

export function DashboardClient() {
  const { selectedActivityId, setSelectedActivityId } = useDashboardStore();
  const statusQuery = useStravaStatusQuery();
  const activitiesQuery = useActivitiesQuery();
  const syncMutation = useSyncStravaMutation();

  const activities = useMemo(() => activitiesQuery.data?.activities ?? [], [activitiesQuery.data?.activities]);

  useEffect(() => {
    if (activities.length === 0 || selectedActivityId) return;
    setSelectedActivityId(activities[0]?.id ?? null);
  }, [activities, selectedActivityId, setSelectedActivityId]);

  if (statusQuery.isLoading) {
    return <DashboardFrame><LoadingCard label="Loading dashboard" /></DashboardFrame>;
  }

  if (!statusQuery.data?.connected) {
    return (
      <DashboardFrame>
        <EmptyState
          title="Connect Strava to build your ride dashboard"
          description="CycleCoach stores your latest cycling activities locally, then lets you pick a ride, inspect the route, and ask the local coach to analyze it."
          action={<ButtonLink href="/me">Go to My Page</ButtonLink>}
        />
      </DashboardFrame>
    );
  }

  return (
    <DashboardFrame
      right={
        <Button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
        >
          {syncMutation.isPending ? "Syncing…" : "Sync latest 30"}
        </Button>
      }
    >
      {syncMutation.isError ? (
        <ErrorState title="Sync failed" description={syncMutation.error.message} actionLabel="Retry sync" onRetry={() => syncMutation.mutate()} />
      ) : null}

      {activitiesQuery.isLoading ? (
        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <LoadingCard label="Loading activities" />
          <LoadingCard label="Loading selected activity" />
        </div>
      ) : activitiesQuery.isError ? (
        <ErrorState
          title="Could not load activities"
          description={activitiesQuery.error.message}
          actionLabel="Retry"
          onRetry={() => void activitiesQuery.refetch()}
        />
      ) : activities.length === 0 ? (
        <EmptyState
          title="No cycling activities cached"
          description="Click sync to fetch your latest 30 Strava activities. Only cycling-like activities are stored."
          action={<Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>{syncMutation.isPending ? "Syncing..." : "Sync now"}</Button>}
        />
      ) : (
        <>
          <DashboardSummary activities={activities} />
          <DashboardAnalyticsPanel />
          <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
            <ActivityListPanel activities={activities} selectedActivityId={selectedActivityId} onSelect={setSelectedActivityId} />
            <ActivityDetailPanel activityId={selectedActivityId ?? activities[0]?.id ?? null} />
          </div>
        </>
      )}
    </DashboardFrame>
  );
}

function DashboardFrame({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <main className="cc-container space-y-5">
      <div className="cc-kinetic-bg rounded-[1.5rem] border border-slate-200/80 bg-white/80 px-5 py-5 shadow-[0_14px_44px_rgba(15,23,42,0.06)] md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4">
            <span className="cc-icon-tile bg-white text-brand">
              <DashboardIcon className="size-5" />
            </span>
            <div>
              <p className="cc-section-label">Training center</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Ride Dashboard</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                Activities, route maps, ride metrics, and coach analysis in one place.
              </p>
            </div>
          </div>
          {right}
        </div>
      </div>
      {children}
    </main>
  );
}

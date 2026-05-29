"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ActivityDetailPanel } from "@/components/dashboard/activity-detail-panel";
import { ActivityListPanel } from "@/components/dashboard/activity-list-panel";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingCard } from "@/components/ui/loading-card";
import { StatusPill } from "@/components/ui/status-pill";
import { useActivitiesQuery, useSyncStravaMutation } from "@/lib/api/activities";
import { useStravaStatusQuery } from "@/lib/api/strava";
import { useDashboardStore } from "@/lib/stores/use-dashboard-store";

export function DashboardClient() {
  const searchParams = useSearchParams();
  const { selectedActivityId, setSelectedActivityId } = useDashboardStore();
  const statusQuery = useStravaStatusQuery();
  const activitiesQuery = useActivitiesQuery();
  const syncMutation = useSyncStravaMutation();

  const activities = useMemo(() => activitiesQuery.data?.activities ?? [], [activitiesQuery.data?.activities]);

  useEffect(() => {
    if (activities.length === 0 || selectedActivityId) return;
    const explicit = searchParams.get("activityId");
    const focus = searchParams.get("focus");
    if (explicit && activities.some((activity) => activity.id === explicit)) {
      setSelectedActivityId(explicit);
    } else if (focus === "latest") {
      setSelectedActivityId(activities[0]?.id ?? null);
    } else {
      setSelectedActivityId(activities[0]?.id ?? null);
    }
  }, [activities, searchParams, selectedActivityId, setSelectedActivityId]);

  if (statusQuery.isLoading) {
    return <DashboardFrame><LoadingCard label="Loading dashboard" /></DashboardFrame>;
  }

  if (!statusQuery.data?.connected) {
    return (
      <DashboardFrame>
        <EmptyState
          title="Connect Strava to build your ride dashboard"
          description="CycleCoach stores your latest cycling activities locally, then lets you pick a ride, inspect the route, and ask the local coach to analyze it."
          action={<a href="/api/auth/strava" className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm">Connect Strava</a>}
        />
      </DashboardFrame>
    );
  }

  return (
    <DashboardFrame
      right={
        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-95 disabled:opacity-60"
        >
          {syncMutation.isPending ? "Syncing…" : "Sync latest 30"}
        </button>
      }
    >
      {syncMutation.isError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{syncMutation.error.message}</div> : null}

      {activitiesQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
          <LoadingCard label="Loading activities" />
          <LoadingCard label="Loading selected activity" />
        </div>
      ) : activities.length === 0 ? (
        <EmptyState
          title="No cycling activities cached"
          description="Click sync to fetch your latest 30 Strava activities. Only cycling-like activities are stored."
          action={<button onClick={() => syncMutation.mutate()} className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white">Sync now</button>}
        />
      ) : (
        <>
          <DashboardSummary activities={activities} />
          <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
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
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <StatusPill tone="orange">Training data center</StatusPill>
            <StatusPill>SQLite local MVP</StatusPill>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Ride Dashboard</h1>
          <p className="mt-2 max-w-2xl text-muted">One place for Strava activities, route maps, ride metrics, and AI coach analysis.</p>
        </div>
        {right}
      </div>
      {children}
    </main>
  );
}

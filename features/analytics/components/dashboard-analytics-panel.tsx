"use client";

import { useQuery } from "@tanstack/react-query";
import { ElevationTrendChart } from "@/features/analytics/components/elevation-trend-chart";
import { RiderTypeCard } from "@/features/analytics/components/rider-type-card";
import { WeeklyTrainingLoadChart } from "@/features/analytics/components/weekly-training-load-chart";
import type { AnalyticsDashboard } from "@/features/analytics/schemas/rider-profile.schema";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { LoadingCard } from "@/components/ui/loading-card";
import { ErrorState } from "@/components/ui/error-state";

export function DashboardAnalyticsPanel() {
  const query = useQuery({
    queryKey: queryKeys.analyticsDashboard,
    queryFn: () => apiGet<AnalyticsDashboard>("/api/analytics/rider-profile")
  });

  if (query.isLoading) return <LoadingCard label="Building analytics" />;
  if (query.isError) {
    return <ErrorState title="Could not load analytics" description={query.error.message} actionLabel="Retry" onRetry={() => void query.refetch()} />;
  }
  if (!query.data) return null;

  return (
    <section className="space-y-4">
      <RiderTypeCard profile={query.data.riderProfile} />
      <div className="grid gap-4 xl:grid-cols-2">
        <WeeklyTrainingLoadChart data={query.data.weeklyLoad} />
        <ElevationTrendChart data={query.data.elevationTrend} />
      </div>
    </section>
  );
}

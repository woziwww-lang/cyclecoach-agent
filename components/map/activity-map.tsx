"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { StravaActivityStream } from "@prisma/client";
import { getRouteData } from "@/lib/map/route-points";
import { EmptyState } from "@/components/ui/empty-state";
import { MapSkeleton } from "@/components/map/map-skeleton";

const LeafletMap = dynamic(() => import("@/components/map/leaflet-activity-map").then((mod) => mod.LeafletActivityMap), {
  ssr: false,
  loading: () => <MapSkeleton />
});

export function ActivityMap({
  polyline,
  stream,
  title
}: {
  polyline?: string | null;
  stream?: Pick<StravaActivityStream, "streamsJson"> | null;
  title?: string;
}) {
  const routeData = useMemo(() => getRouteData({ summaryPolyline: polyline, stream }), [polyline, stream]);

  if (routeData.points.length < 2) {
    return (
      <div className="rounded-3xl border bg-white p-5 shadow-soft">
        <EmptyState
          title="No route data"
          description="This activity does not have usable route points yet. Try refreshing detail and streams, reconnect Strava with activity:read_all, or choose an outdoor ride."
        />
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <Diagnostic label="summary polyline" value={routeData.hasSummaryPolyline ? "present" : "missing"} />
          <Diagnostic label="decoded polyline points" value={String(routeData.summaryPolylinePoints)} />
          <Diagnostic label="lat/lng stream points" value={String(routeData.streamLatLngPoints)} />
        </div>
      </div>
    );
  }

  return <LeafletMap points={routeData.points} title={title} source={routeData.source} />;
}

function Diagnostic({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

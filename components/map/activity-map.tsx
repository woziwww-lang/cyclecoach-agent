"use client";

import { useMemo } from "react";
import { decodePolyline } from "@/lib/map/polyline";

export function ActivityMap({ polyline }: { polyline?: string | null }) {
  const points = useMemo(() => (polyline ? decodePolyline(polyline) : []), [polyline]);

  if (!polyline || points.length === 0) {
    return (
      <section className="flex h-72 items-center justify-center rounded-lg border bg-white text-muted shadow-soft">
        No route polyline available for this activity.
      </section>
    );
  }

  const path = points.map(([lat, lng]) => `${lng},${lat}`).join(" ");

  return (
    <section className="rounded-lg border bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Route preview</h2>
        <p className="text-sm text-muted">{points.length} points</p>
      </div>
      <div className="overflow-hidden rounded-md border bg-slate-100">
        <svg viewBox={buildViewBox(points)} className="h-72 w-full">
          <polyline points={path} fill="none" stroke="#FC4C02" strokeWidth="0.0025" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <p className="mt-2 text-xs text-muted">
        Minimal SVG route preview for the first slice. Leaflet can replace this without changing data flow.
      </p>
    </section>
  );
}

function buildViewBox(points: [number, number][]) {
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const padLat = Math.max((maxLat - minLat) * 0.1, 0.001);
  const padLng = Math.max((maxLng - minLng) * 0.1, 0.001);
  return `${minLng - padLng} ${minLat - padLat} ${maxLng - minLng + padLng * 2} ${maxLat - minLat + padLat * 2}`;
}

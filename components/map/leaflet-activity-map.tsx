"use client";

import { useEffect, useRef, useState } from "react";
import type { RoutePoint } from "@/lib/map/route-points";
import { EmptyState } from "@/components/ui/empty-state";

type LeafletModule = typeof import("leaflet");

export function LeafletActivityMap({
  points,
  title = "Route map",
  source
}: {
  points: RoutePoint[];
  title?: string;
  source?: string;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<{ remove: () => void; invalidateSize: () => void } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current || points.length < 2) return;
    let cancelled = false;

    void import("leaflet")
      .then((leafletModule) => {
        if (!mapRef.current || cancelled) return;
        const L = normalizeLeafletModule(leafletModule);
        if (!L?.map) throw new Error("Leaflet module did not expose map()");

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        mapRef.current.replaceChildren();

        const map = L.map(mapRef.current, {
          scrollWheelZoom: false,
          zoomControl: true,
          attributionControl: true
        });
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        const latLngs = points.map(([lat, lng]) => L.latLng(lat, lng));
        const route = L.polyline(latLngs, {
          color: "#FC4C02",
          weight: 4,
          opacity: 0.92,
          lineJoin: "round"
        }).addTo(map);

        const startIcon = L.divIcon({
          className: "",
          html: '<div style="width:20px;height:20px;border-radius:999px;background:#10b981;border:3px solid white;box-shadow:0 8px 18px rgba(15,23,42,.22)"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        const finishIcon = L.divIcon({
          className: "",
          html: '<div style="width:20px;height:20px;border-radius:999px;background:#FC4C02;border:3px solid white;box-shadow:0 8px 18px rgba(15,23,42,.22)"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        L.marker(latLngs[0], { icon: startIcon }).addTo(map).bindTooltip("Start");
        L.marker(latLngs[latLngs.length - 1], { icon: finishIcon }).addTo(map).bindTooltip("Finish");
        map.fitBounds(route.getBounds(), { padding: [26, 26] });
        window.setTimeout(() => map.invalidateSize(), 80);
        window.setTimeout(() => map.invalidateSize(), 280);
      })
      .catch((error) => {
        setFailed(error instanceof Error ? error.message : String(error));
      });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [points]);

  if (failed) {
    return (
      <EmptyState
        title="Map failed to load"
        description={`Leaflet could not initialize: ${failed}. The route data is present, so this is a rendering issue rather than missing Strava data.`}
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border bg-white shadow-soft">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-muted">{points.length.toLocaleString()} route points{source ? ` from ${source}` : ""}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" />Start</span>
          <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-brand" />Finish</span>
        </div>
      </div>
      <div ref={mapRef} className="min-h-[320px] w-full lg:min-h-[480px]" />
    </section>
  );
}

function normalizeLeafletModule(module: LeafletModule | (LeafletModule & { default?: LeafletModule })) {
  return "default" in module && module.default ? module.default : module;
}

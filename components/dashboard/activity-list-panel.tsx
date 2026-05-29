"use client";

import type { StravaActivity } from "@prisma/client";
import clsx from "clsx";
import { formatDistanceKm, formatDuration, formatSpeedKph } from "@/lib/format";
import { StatusPill } from "@/components/ui/status-pill";

export function ActivityListPanel({
  activities,
  selectedActivityId,
  onSelect
}: {
  activities: StravaActivity[];
  selectedActivityId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.045)] xl:sticky xl:top-24">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="font-semibold">Recent cycling activities</h2>
        <p className="text-sm text-muted">Pick one ride to inspect.</p>
      </div>
      <div className="cc-scrollbar max-h-[680px] overflow-auto p-2">
        {activities.map((activity) => (
          <button
            key={activity.id}
            type="button"
            onClick={() => onSelect(activity.id)}
            className={clsx(
              "w-full rounded-2xl p-3 text-left transition hover:bg-slate-50 active:scale-[0.99]",
              selectedActivityId === activity.id && "bg-orange-50/80 ring-1 ring-brand/25"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold leading-5">{activity.name}</h3>
                <p className="mt-1 text-xs text-muted">{new Date(activity.startDate).toLocaleString()}</p>
              </div>
              {activity.summaryPolyline ? <StatusPill tone="green">route</StatusPill> : null}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <Metric label="Distance" value={formatDistanceKm(activity.distanceMeters)} />
              <Metric label="Moving" value={formatDuration(activity.movingTimeSec)} />
              <Metric label="Speed" value={formatSpeedKph(activity.averageSpeed)} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {activity.averageHeartrate ? <StatusPill>HR</StatusPill> : null}
              {activity.averageWatts ? <StatusPill>Power</StatusPill> : null}
              {activity.averageCadence ? <StatusPill>Cadence</StatusPill> : null}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}

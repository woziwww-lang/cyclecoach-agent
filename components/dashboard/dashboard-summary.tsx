import type { StravaActivity } from "@prisma/client";
import { formatDistanceKm, formatDuration } from "@/lib/format";

export function DashboardSummary({ activities }: { activities: StravaActivity[] }) {
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = activities.filter((activity) => new Date(activity.startDate).getTime() >= since);
  const distance = recent.reduce((sum, activity) => sum + (activity.distanceMeters ?? 0), 0);
  const elevation = recent.reduce((sum, activity) => sum + (activity.totalElevationGain ?? 0), 0);
  const moving = recent.reduce((sum, activity) => sum + (activity.movingTimeSec ?? 0), 0);

  const cards = [
    { label: "Recent rides", value: String(recent.length), note: "last 30 days" },
    { label: "30d distance", value: formatDistanceKm(distance), note: "synced from Strava" },
    { label: "30d elevation", value: `${Math.round(elevation)} m`, note: "total gain" },
    { label: "30d moving time", value: formatDuration(moving), note: "active time" }
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-3xl border bg-white p-5 shadow-soft">
          <p className="text-sm font-medium text-muted">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{card.value}</p>
          <p className="mt-1 text-xs text-muted">{card.note}</p>
        </div>
      ))}
    </section>
  );
}

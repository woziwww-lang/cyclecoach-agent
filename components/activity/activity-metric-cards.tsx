import { StravaActivity } from "@prisma/client";
import { formatDistanceKm, formatDuration, formatSpeedKph } from "@/lib/format";

export function ActivityMetricCards({ activity }: { activity: StravaActivity }) {
  const metrics = [
    ["Distance", formatDistanceKm(activity.distanceMeters)],
    ["Moving time", formatDuration(activity.movingTimeSec)],
    ["Elapsed time", formatDuration(activity.elapsedTimeSec)],
    ["Avg speed", formatSpeedKph(activity.averageSpeed)],
    ["Max speed", formatSpeedKph(activity.maxSpeed)],
    ["Elevation", `${Math.round(activity.totalElevationGain ?? 0)} m`],
    ["Avg HR", activity.averageHeartrate ? `${Math.round(activity.averageHeartrate)} bpm` : "Missing"],
    ["Avg power", activity.averageWatts ? `${Math.round(activity.averageWatts)} W` : "Missing"],
    ["Cadence", activity.averageCadence ? `${Math.round(activity.averageCadence)} rpm` : "Missing"],
    ["Calories", activity.calories ? `${Math.round(activity.calories)} kcal` : "Missing"]
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map(([label, value]) => (
        <div key={label} className="rounded-lg border bg-white p-4 shadow-soft">
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
        </div>
      ))}
    </section>
  );
}

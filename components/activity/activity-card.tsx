import { StravaActivity } from "@prisma/client";
import { formatDistanceKm, formatDuration, formatSpeedKph } from "@/lib/format";

export function ActivityCard({ activity }: { activity: StravaActivity }) {
  return (
    <a className="block rounded-lg border bg-white p-4 shadow-soft transition hover:border-brand" href={`/activities/${activity.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">{activity.name}</h2>
          <p className="text-sm text-muted">{activity.startDate.toLocaleString()}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {activity.averageHeartrate ? <Badge>HR</Badge> : null}
            {activity.averageWatts ? <Badge>Power</Badge> : null}
            {activity.summaryPolyline ? <Badge>Route</Badge> : null}
            {activity.averageCadence ? <Badge>Cadence</Badge> : null}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-right text-sm">
          <span className="text-muted">Distance</span>
          <span className="font-medium">{formatDistanceKm(activity.distanceMeters)}</span>
          <span className="text-muted">Moving</span>
          <span className="font-medium">{formatDuration(activity.movingTimeSec)}</span>
          <span className="text-muted">Avg speed</span>
          <span className="font-medium">{formatSpeedKph(activity.averageSpeed)}</span>
          <span className="text-muted">Elevation</span>
          <span className="font-medium">{Math.round(activity.totalElevationGain ?? 0)} m</span>
        </div>
      </div>
    </a>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-orange-50 px-2 py-1 font-medium text-brand">{children}</span>;
}

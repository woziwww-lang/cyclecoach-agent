import type { RecentTrainingSummary, RidePlan } from "@/features/planner/schemas/ride-plan.schema";
import { TrainingBlockTimeline } from "@/features/planner/components/training-block-timeline";
import { StatusPill } from "@/components/ui/status-pill";

export function RidePlanResult({
  plan,
  recentTraining,
  fallbackUsed
}: {
  plan: RidePlan;
  recentTraining: RecentTrainingSummary;
  fallbackUsed?: boolean;
}) {
  return (
    <section className="space-y-4">
      <article className="cc-card overflow-hidden">
        <div className="border-b border-slate-100 bg-orange-50/55 p-5">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="orange">{plan.rideType.replace("_", " ")}</StatusPill>
            <StatusPill>{plan.intensity}</StatusPill>
            <StatusPill tone={plan.confidence.level === "high" ? "green" : plan.confidence.level === "medium" ? "orange" : "slate"}>{plan.confidence.level} confidence</StatusPill>
            {fallbackUsed || plan.fallbackUsed ? <StatusPill>rule fallback</StatusPill> : null}
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">{plan.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{plan.coachSummary}</p>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-3">
          <Metric label="Duration" value={`${plan.durationMinutes} min`} />
          <Metric label="Route type" value={plan.routeType} />
          <Metric label="Intensity" value={plan.intensity} />
        </div>
      </article>

      <article className="cc-card p-5">
        <div className="mb-4">
          <p className="cc-section-label">Workout structure</p>
          <h2 className="mt-1 text-xl font-semibold">Training blocks</h2>
        </div>
        <TrainingBlockTimeline plan={plan} />
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdviceCard title="Fuel & Hydration" items={plan.nutrition} />
        <AdviceCard title="Recovery" items={plan.recovery} />
      </div>

      <article className="cc-card p-5">
        <p className="cc-section-label">Personalization</p>
        {recentTraining.hasData ? (
          <p className="mt-2 text-sm leading-6 text-muted">
            Using recent Strava context: latest ride {recentTraining.latestRideName ?? "unknown"}, 7d {recentTraining.sevenDayDistanceKm.toFixed(1)} km,
            {" "}{Math.round(recentTraining.sevenDayElevationM)} m elevation, {recentTraining.sevenDayMovingHours.toFixed(1)} moving hours.
          </p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-muted">No recent Strava context was used. Connect Strava in My Page for more personalized plans.</p>
        )}
        <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-muted">{plan.confidence.reason}</p>
      </article>

      <AdviceCard title="Safety notes" items={plan.safetyNotes} tone="amber" />
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function AdviceCard({ title, items, tone = "slate" }: { title: string; items: string[]; tone?: "slate" | "amber" }) {
  return (
    <article className={tone === "amber" ? "cc-card border-amber-200 bg-amber-50/60 p-5" : "cc-card p-5"}>
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

import type { RouteCandidate, RidePlan, TrainingMemory } from "@/features/planner/schemas/ride-plan.schema";
import { TrainingBlockTimeline } from "@/features/planner/components/training-block-timeline";
import { StatusPill } from "@/components/ui/status-pill";

export function RidePlanResult({
  plan,
  trainingMemory,
  routeCandidates,
  fallbackUsed
}: {
  plan: RidePlan;
  trainingMemory: TrainingMemory;
  routeCandidates: RouteCandidate[];
  fallbackUsed?: boolean;
}) {
  return (
    <section className="space-y-4">
      <article className="cc-card overflow-hidden">
        <div className="border-b border-slate-100 bg-orange-50/55 p-5">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="orange">{plan.trainingPurpose.replace("_", " ")}</StatusPill>
            <StatusPill>{plan.intensity}</StatusPill>
            <StatusPill>{plan.recommendedRoute.source.replace("_", " ")}</StatusPill>
            <StatusPill tone={plan.confidence.level === "high" ? "green" : plan.confidence.level === "medium" ? "orange" : "slate"}>{plan.confidence.level} confidence</StatusPill>
            {fallbackUsed || plan.fallbackUsed ? <StatusPill>rule fallback</StatusPill> : null}
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">{plan.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{plan.summary}</p>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-4">
          <Metric label="Route" value={plan.recommendedRoute.name} />
          <Metric label="Distance" value={plan.recommendedRoute.estimatedDistanceKm ? `${plan.recommendedRoute.estimatedDistanceKm.toFixed(1)} km` : "flexible"} />
          <Metric label="Elevation" value={plan.recommendedRoute.estimatedElevationM ? `${Math.round(plan.recommendedRoute.estimatedElevationM)} m` : "unknown"} />
          <Metric label="Duration" value={`${plan.recommendedRoute.estimatedDurationMinutes} min`} />
        </div>
      </article>

      <article className="cc-card p-5">
        <p className="cc-section-label">Recent context</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Metric label="Latest ride" value={trainingMemory.latestRide?.name ?? "none"} />
          <Metric label="7d load" value={`${trainingMemory.last7Days.distanceKm.toFixed(1)} km · ${Math.round(trainingMemory.last7Days.elevationM)} m`} />
          <Metric label="Route memory" value={`${trainingMemory.routeMemory.length} mapped routes`} />
        </div>
        <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-muted">{trainingMemory.last30Days.trendSummary}</p>
        {trainingMemory.fatigueSignals.length ? <BulletList title="Fatigue signals" items={trainingMemory.fatigueSignals} tone="amber" /> : null}
      </article>

      <article className="cc-card p-5">
        <p className="cc-section-label">Recommended route</p>
        <h2 className="mt-1 text-xl font-semibold">{plan.recommendedRoute.name}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{plan.recommendedRoute.reason}</p>
        {plan.recommendedRoute.basedOnActivityId ? (
          <p className="mt-3 rounded-2xl bg-green-50 p-3 text-sm text-green-800">
            Based on one of your previous Strava routes. Open Dashboard to inspect the original mapped ride.
          </p>
        ) : null}
      </article>

      <article className="cc-card p-5">
        <div className="mb-4">
          <p className="cc-section-label">Workout structure</p>
          <h2 className="mt-1 text-xl font-semibold">Training blocks</h2>
        </div>
        <TrainingBlockTimeline plan={plan} />
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <BulletList title="Why this fits today" items={plan.whyThisFitsToday} />
        <BulletList title="Avoid today" items={plan.avoidToday} tone="amber" />
        <BulletList title="Fuel & Hydration" items={plan.nutrition} />
        <BulletList title="Recovery" items={plan.recovery} />
      </div>

      <BulletList title="Safety notes" items={plan.safetyNotes} tone="amber" />
      {plan.missingData.length ? <BulletList title="Missing data" items={plan.missingData} tone="slate" /> : null}

      {routeCandidates.length > 1 ? (
        <article className="cc-card p-5">
          <p className="cc-section-label">Other candidates considered</p>
          <div className="mt-3 grid gap-2">
            {routeCandidates.slice(1, 4).map((candidate) => (
              <div key={candidate.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{candidate.name}</p>
                  <StatusPill>{candidate.source.replace("_", " ")}</StatusPill>
                </div>
                <p className="mt-1 text-sm text-muted">{candidate.scoreReasons[0] ?? candidate.notes}</p>
              </div>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 line-clamp-2 font-semibold">{value}</p>
    </div>
  );
}

function BulletList({ title, items, tone = "slate" }: { title: string; items: string[]; tone?: "slate" | "amber" }) {
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

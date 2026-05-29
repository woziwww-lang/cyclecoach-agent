"use client";

import { useMemo, useState } from "react";
import { RidePlanForm } from "@/features/planner/components/ride-plan-form";
import { RidePlanResult } from "@/features/planner/components/ride-plan-result";
import { RidePlanSkeleton } from "@/features/planner/components/ride-plan-skeleton";
import { useGenerateRidePlanMutation } from "@/features/planner/api/planner";
import { generateRidePlan } from "@/features/planner/services/ride-plan-generator";
import type { RecentTrainingSummary, RidePlanInput } from "@/features/planner/schemas/ride-plan.schema";
import { useStravaStatusQuery } from "@/lib/api/strava";
import { ErrorState } from "@/components/ui/error-state";

const initialInput: RidePlanInput = {
  durationMinutes: 90,
  goal: "endurance",
  readiness: "normal",
  useLatestRideContext: true
};

const noRecentTraining: RecentTrainingSummary = {
  hasData: false,
  latestRideName: null,
  latestRideDate: null,
  sevenDayDistanceKm: 0,
  sevenDayElevationM: 0,
  sevenDayMovingHours: 0,
  possibleHighIntensity: false
};

export function PlanNextRidePage() {
  const [input, setInput] = useState<RidePlanInput>(initialInput);
  const [generated, setGenerated] = useState<{
    plan: ReturnType<typeof generateRidePlan>;
    recentTraining: RecentTrainingSummary;
    fallbackUsed: boolean;
  } | null>(null);
  const statusQuery = useStravaStatusQuery();
  const mutation = useGenerateRidePlanMutation();

  const preview = useMemo(() => generateRidePlan(input, noRecentTraining), [input]);
  const currentPlan = generated?.plan ?? preview;
  const currentRecent = generated?.recentTraining ?? noRecentTraining;
  const stravaConnected = Boolean(statusQuery.data?.connected);

  async function generate() {
    const response = await mutation.mutateAsync(input);
    setGenerated({
      plan: response.plan,
      recentTraining: response.recentTraining,
      fallbackUsed: response.fallbackUsed
    });
  }

  return (
    <main className="cc-container space-y-5">
      <section className="cc-card-muted px-5 py-5 md:px-6">
        <p className="cc-section-label">Next workout</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">Plan Next Ride</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Build a practical next-ride plan from your time budget, training goal, readiness, and optional recent Strava context.
        </p>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <RidePlanForm
          value={input}
          onChange={(next) => {
            setInput(next);
            setGenerated(null);
          }}
          onGenerate={generate}
          loading={mutation.isPending}
          stravaConnected={stravaConnected}
        />

        <div className="space-y-4">
          {!stravaConnected ? (
            <section className="cc-card border-amber-200 bg-amber-50/60 p-4">
              <h2 className="font-semibold text-amber-950">No Strava context yet</h2>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Planner still works with manual inputs. Connect Strava in My Page for more personalized plans.
              </p>
            </section>
          ) : null}

          <section className="cc-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Weather check</h2>
                <p className="text-sm text-muted">Weather risk is not connected yet. Check rain, wind, heat, and daylight before riding.</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-muted">placeholder</span>
            </div>
          </section>

          {mutation.isError ? (
            <ErrorState
              title="Coach generation failed"
              description={mutation.error.message}
              actionLabel="Try again"
              onRetry={generate}
            />
          ) : null}

          {mutation.isPending ? (
            <RidePlanSkeleton />
          ) : (
            <RidePlanResult plan={currentPlan} recentTraining={currentRecent} fallbackUsed={generated?.fallbackUsed} />
          )}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { RidePlanForm } from "@/features/planner/components/ride-plan-form";
import { RidePlanResult } from "@/features/planner/components/ride-plan-result";
import { RidePlanSkeleton } from "@/features/planner/components/ride-plan-skeleton";
import { useGenerateRidePlanMutation } from "@/features/planner/api/planner";
import { emptyTrainingMemory } from "@/features/agent/memory/build-training-memory";
import { generateDeterministicRidePlan } from "@/features/agent/tools/generate-deterministic-ride-plan";
import { matchRouteCandidates } from "@/features/agent/tools/match-route-candidates";
import { getRouteCatalog } from "@/features/agent/data/route-catalog";
import type { RidePlanInput, RouteCandidate, TrainingMemory } from "@/features/planner/schemas/ride-plan.schema";
import { useStravaStatusQuery } from "@/lib/api/strava";
import { ErrorState } from "@/components/ui/error-state";
import { PlannerIcon } from "@/components/ui/icons";

const initialInput: RidePlanInput = {
  durationMinutes: 90,
  goal: "endurance",
  readiness: "normal",
  routePreference: "not_sure",
  useLatestRideContext: true
};

const noTrainingMemory = emptyTrainingMemory();

export function PlanNextRidePage() {
  const [input, setInput] = useState<RidePlanInput>(initialInput);
  const [generated, setGenerated] = useState<{
    plan: ReturnType<typeof generateDeterministicRidePlan>;
    trainingMemory: TrainingMemory;
    routeCandidates: RouteCandidate[];
    fallbackUsed: boolean;
  } | null>(null);
  const statusQuery = useStravaStatusQuery();
  const mutation = useGenerateRidePlanMutation();

  const previewCandidates = useMemo(() => matchRouteCandidates(input, noTrainingMemory, [], getRouteCatalog()), [input]);
  const preview = useMemo(() => generateDeterministicRidePlan(input, noTrainingMemory, previewCandidates), [input, previewCandidates]);
  const currentPlan = generated?.plan ?? preview;
  const currentMemory = generated?.trainingMemory ?? noTrainingMemory;
  const currentCandidates = generated?.routeCandidates ?? previewCandidates;
  const stravaConnected = Boolean(statusQuery.data?.connected);

  async function generate() {
    const response = await mutation.mutateAsync(input);
    setGenerated({
      plan: response.plan,
      trainingMemory: response.trainingMemory,
      routeCandidates: response.routeCandidates,
      fallbackUsed: response.fallbackUsed
    });
  }

  return (
    <main className="cc-container space-y-5">
      <section className="cc-kinetic-bg rounded-[1.5rem] border border-slate-200/80 bg-white/80 px-5 py-5 shadow-[0_14px_44px_rgba(15,23,42,0.06)] md:px-6">
        <div className="flex gap-4">
          <span className="cc-icon-tile bg-white text-brand">
            <PlannerIcon className="size-5" />
          </span>
          <div>
            <p className="cc-section-label">Next workout</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">Plan Next Ride</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Build a practical next-ride plan from your time budget, training goal, readiness, and optional recent Strava context.
            </p>
          </div>
        </div>
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
            <RidePlanResult plan={currentPlan} trainingMemory={currentMemory} routeCandidates={currentCandidates} fallbackUsed={generated?.fallbackUsed} />
          )}
        </div>
      </div>
    </main>
  );
}

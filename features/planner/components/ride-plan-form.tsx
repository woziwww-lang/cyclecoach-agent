"use client";

import clsx from "clsx";
import type { RidePlanInput } from "@/features/planner/schemas/ride-plan.schema";
import { Button } from "@/components/ui/button";

const durationOptions = [
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
  { label: "2 hours", value: 120 }
];

const goals: Array<{ value: RidePlanInput["goal"]; title: string; description: string }> = [
  { value: "recovery", title: "Recovery", description: "Easy spin or rest-first guidance." },
  { value: "endurance", title: "Endurance / Z2", description: "Steady aerobic development." },
  { value: "climbing", title: "Climbing", description: "Controlled hill strength work." },
  { value: "ftp", title: "FTP / Tempo", description: "Focused but not reckless intensity." },
  { value: "fat_loss", title: "Fat loss", description: "Repeatable aerobic volume." },
  { value: "long_ride", title: "Weekend long ride", description: "Durability and fueling practice." }
];

const readinessOptions: Array<{ value: RidePlanInput["readiness"]; label: string }> = [
  { value: "fresh", label: "Fresh" },
  { value: "normal", label: "Normal" },
  { value: "tired", label: "Tired" },
  { value: "not_sure", label: "Not sure" }
];

export function RidePlanForm({
  value,
  onChange,
  onGenerate,
  loading,
  stravaConnected
}: {
  value: RidePlanInput;
  onChange: (value: RidePlanInput) => void;
  onGenerate: () => void;
  loading: boolean;
  stravaConnected: boolean;
}) {
  function update(patch: Partial<RidePlanInput>) {
    onChange({ ...value, ...patch });
  }

  return (
    <section className="cc-card p-5 lg:sticky lg:top-24">
      <p className="cc-section-label">Quick inputs</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Plan Next Ride</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Choose the constraints. CycleCoach updates the plan instantly, then can ask Ollama to polish the coach note.</p>

      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold">Available time</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {durationOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => update({ durationMinutes: option.value })}
                className={pillClass(value.durationMinutes === option.value)}
              >
                {option.label}
              </button>
            ))}
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold">
              Custom
              <input
                type="number"
                min={20}
                max={360}
                value={value.durationMinutes}
                onChange={(event) => update({ durationMinutes: Number(event.target.value) || 60 })}
                className="w-16 bg-transparent text-right outline-none"
              />
            </label>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Training goal</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {goals.map((goal) => (
              <button
                type="button"
                key={goal.value}
                onClick={() => update({ goal: goal.value })}
                className={clsx(
                  "rounded-2xl border p-3 text-left transition duration-200 ease-out hover:border-brand/35 active:scale-[0.99]",
                  value.goal === goal.value ? "border-brand/30 bg-orange-50" : "border-slate-200 bg-white"
                )}
              >
                <p className="font-semibold">{goal.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{goal.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Current state</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {readinessOptions.map((option) => (
              <button type="button" key={option.value} onClick={() => update({ readiness: option.value })} className={pillClass(value.readiness === option.value)}>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
          <input
            type="checkbox"
            checked={value.useLatestRideContext}
            onChange={(event) => update({ useLatestRideContext: event.target.checked })}
            className="mt-1"
          />
          <span>
            <span className="font-semibold">Use latest ride context</span>
            <span className="block text-muted">{stravaConnected ? "Uses recent Strava activity when available." : "No Strava connection detected. You can still plan without data."}</span>
          </span>
        </label>

        <Button onClick={onGenerate} disabled={loading} className="w-full">
          {loading ? "Generating..." : "Generate Coach Plan"}
        </Button>
      </div>
    </section>
  );
}

function pillClass(active: boolean) {
  return clsx(
    "rounded-2xl border px-3 py-2 text-sm font-semibold transition duration-200 ease-out active:scale-[0.98]",
    active ? "border-brand/30 bg-orange-50 text-brand shadow-[inset_0_0_0_1px_rgba(249,115,22,0.12)]" : "border-slate-200 bg-white text-ink hover:border-brand/20 hover:bg-orange-50/60"
  );
}

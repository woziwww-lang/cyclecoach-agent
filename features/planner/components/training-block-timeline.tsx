import type { RidePlan } from "@/features/planner/schemas/ride-plan.schema";

export function TrainingBlockTimeline({ plan }: { plan: RidePlan }) {
  const blocks = [
    {
      title: "Warmup",
      durationMinutes: plan.workoutStructure.warmup.durationMinutes,
      intensity: "Easy",
      description: plan.workoutStructure.warmup.description
    },
    ...plan.workoutStructure.mainSet,
    {
      title: "Cooldown",
      durationMinutes: plan.workoutStructure.cooldown.durationMinutes,
      intensity: "Easy",
      description: plan.workoutStructure.cooldown.description
    }
  ];

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <div key={`${block.title}-${index}`} className="grid grid-cols-[2.5rem_1fr] gap-3">
          <div className="flex flex-col items-center">
            <span className="flex size-8 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-brand ring-1 ring-orange-100">{index + 1}</span>
            {index < blocks.length - 1 ? <span className="mt-2 h-full w-px bg-slate-200" /> : null}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{block.title}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-muted">{block.durationMinutes} min · {block.intensity}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{block.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

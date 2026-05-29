const steps = ["Reading your ride…", "Checking effort pattern…", "Building coaching advice…"];

export function AnalysisSkeleton() {
  return (
    <div className="space-y-4 rounded-3xl border bg-white p-4 shadow-soft">
      <div className="space-y-2 rounded-2xl bg-orange-50/70 p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-orange-200/80" />
        <div className="h-8 w-4/5 animate-pulse rounded bg-orange-100" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-6 w-28 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="grid gap-3">
        {steps.map((step) => (
          <div key={step} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-muted">
            <span className="size-2 animate-pulse rounded-full bg-brand" />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

export function RidePlanSkeleton() {
  return (
    <div className="cc-card space-y-4 p-5">
      <div className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
        <div className="h-4 w-32 animate-pulse rounded-full bg-orange-200/80" />
        <div className="h-7 w-3/4 animate-pulse rounded-xl bg-orange-100" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-orange-100" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 p-4">
            <div className="h-3 w-16 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-3 h-6 w-20 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>
      {["Reading recent rides...", "Checking training load...", "Matching route candidates...", "Building ride plan..."].map((step) => (
        <div key={step} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-medium text-muted">
          <span className="size-2 animate-pulse rounded-full bg-brand" />
          {step}
        </div>
      ))}
    </div>
  );
}

export function MapSkeleton() {
  return (
    <section className="flex min-h-[320px] items-center justify-center rounded-3xl border bg-white p-5 shadow-soft lg:min-h-[480px]">
      <div className="w-full space-y-4">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-[280px] animate-pulse rounded-2xl bg-slate-100 lg:h-[420px]" />
        <div className="flex gap-2">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </section>
  );
}

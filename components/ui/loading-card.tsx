export function LoadingCard({ label = "Loading" }: { label?: string }) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-soft">
      <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-8 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-3 w-full animate-pulse rounded bg-slate-100" />
      <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
      <p className="sr-only">{label}</p>
    </div>
  );
}

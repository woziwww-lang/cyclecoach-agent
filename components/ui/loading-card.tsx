export function LoadingCard({ label = "Loading" }: { label?: string }) {
  return (
    <div className="cc-card p-5">
      <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-4 h-8 w-40 animate-pulse rounded-xl bg-slate-200" />
      <div className="mt-5 space-y-2">
        <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
      </div>
      <p className="sr-only">{label}</p>
    </div>
  );
}

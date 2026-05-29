export function ChatSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <div className="size-9 animate-pulse rounded-2xl bg-orange-100" />
      <div className="max-w-[80%] rounded-3xl bg-white p-4 shadow-soft">
        <div className="h-3 w-44 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-3 w-64 animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-3 w-36 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

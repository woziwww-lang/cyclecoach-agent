export function ChartEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 leading-6 text-muted">{description}</p>
    </div>
  );
}

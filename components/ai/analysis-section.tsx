export function AnalysisSection({
  icon,
  title,
  children
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-orange-50 text-sm text-brand">{icon}</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="text-sm leading-6 text-slate-700">{children}</div>
    </section>
  );
}

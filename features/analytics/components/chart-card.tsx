export function ChartCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <article className="cc-card p-5">
      <div className="mb-4">
        <p className="cc-section-label">Analytics</p>
        <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {children}
    </article>
  );
}

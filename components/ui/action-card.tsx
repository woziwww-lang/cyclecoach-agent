import clsx from "clsx";

export function ActionCard({
  href,
  title,
  description,
  icon,
  meta,
  primary
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
  meta?: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      className={clsx(
        "group block rounded-3xl border bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-lg active:translate-y-0",
        primary && "border-brand/30 bg-orange-50/60"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-slate-200">{icon}</span>
        {meta ? <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-muted">{meta}</span> : null}
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <span className="mt-4 inline-flex text-sm font-semibold text-brand transition group-hover:translate-x-0.5">Open →</span>
    </a>
  );
}

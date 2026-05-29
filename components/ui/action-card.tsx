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
        "group block rounded-[1.25rem] border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.045)] transition duration-200 hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)] active:translate-y-0",
        primary && "border-brand/25 bg-orange-50/55"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-slate-50 text-lg shadow-sm ring-1 ring-slate-200">{icon}</span>
        {meta ? <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-muted">{meta}</span> : null}
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <span className="mt-4 inline-flex text-sm font-semibold text-brand transition group-hover:translate-x-0.5">Open</span>
    </a>
  );
}

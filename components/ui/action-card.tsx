import clsx from "clsx";
import { ArrowRightIcon } from "@/components/ui/icons";

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
  icon: React.ReactNode;
  meta?: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      className={clsx(
        "group block rounded-[1.25rem] border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.045)] transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out hover:border-brand/35 hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)] active:scale-[0.99]",
        primary && "border-brand/25 bg-orange-50/55"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="cc-icon-tile text-brand transition duration-200 group-hover:bg-brand group-hover:text-white">
          {icon}
        </span>
        {meta ? (
          <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-muted transition group-hover:border-brand/25 group-hover:text-ink">
            {meta}
          </span>
        ) : null}
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition group-hover:gap-2">
        Open
        <ArrowRightIcon className="size-4" />
      </span>
    </a>
  );
}

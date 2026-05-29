import clsx from "clsx";

type Tone = "green" | "orange" | "red" | "slate";

export function StatusPill({ children, tone = "slate" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        tone === "green" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "orange" && "border-orange-200 bg-orange-50 text-brand",
        tone === "red" && "border-red-200 bg-red-50 text-red-700",
        tone === "slate" && "border-slate-200 bg-slate-50 text-slate-600"
      )}
    >
      {children}
    </span>
  );
}

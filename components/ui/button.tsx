import clsx from "clsx";

type ButtonTone = "primary" | "secondary" | "ghost" | "danger";

export function buttonClassName(tone: ButtonTone = "primary", className?: string) {
  return clsx(
    "inline-flex min-h-10 items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55",
    tone === "primary" && "bg-brand text-white shadow-sm hover:bg-orange-600",
    tone === "secondary" && "border border-slate-200 bg-white text-ink shadow-sm hover:bg-slate-50",
    tone === "ghost" && "text-muted hover:bg-slate-100 hover:text-ink",
    tone === "danger" && "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    className
  );
}

export function Button({
  tone = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  return <button className={buttonClassName(tone, className)} {...props} />;
}

export function ButtonLink({
  tone = "primary",
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { tone?: ButtonTone }) {
  return <a className={buttonClassName(tone, className)} {...props} />;
}

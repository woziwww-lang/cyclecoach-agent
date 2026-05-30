import clsx from "clsx";

type ButtonTone = "primary" | "secondary" | "ghost" | "danger";

export function buttonClassName(tone: ButtonTone = "primary", className?: string) {
  return clsx(
    "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
    tone === "primary" && "bg-brand text-white shadow-sm hover:bg-orange-600 hover:shadow-[0_10px_24px_rgba(249,115,22,0.22)]",
    tone === "secondary" && "border border-slate-200 bg-white text-ink shadow-sm hover:border-brand/20 hover:bg-orange-50/60",
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

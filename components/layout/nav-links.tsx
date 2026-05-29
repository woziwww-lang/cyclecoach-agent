"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";

export type NavItem = { href: string; label: string; icon?: string };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 text-sm text-muted md:flex">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={clsx(
            "rounded-full px-3 py-1.5 transition hover:bg-white hover:text-ink hover:shadow-sm",
            isActive(pathname, item.href) && "bg-white text-ink shadow-sm"
          )}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}

export function MobileNavLinks({ items }: { items: Required<Pick<NavItem, "href" | "label" | "icon">>[] }) {
  const pathname = usePathname();
  return (
    <div className="grid grid-cols-5 gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-xs font-medium text-muted transition active:scale-95",
              active ? "bg-orange-50 text-brand" : "active:bg-orange-50"
            )}
          >
            <span className={clsx("text-lg leading-none", active ? "text-brand" : "text-ink")}>{item.icon}</span>
            {item.label}
          </a>
        );
      })}
    </div>
  );
}

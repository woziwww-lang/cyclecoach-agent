"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { ReactNode } from "react";

export type NavItem = { href: string; label: string; icon?: ReactNode };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1 text-sm text-muted shadow-[0_8px_22px_rgba(15,23,42,0.045)] backdrop-blur md:flex">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={clsx(
            "rounded-full px-3 py-1.5 transition duration-200 ease-out hover:bg-orange-50 hover:text-ink",
            isActive(pathname, item.href) && "bg-ink text-white shadow-sm hover:bg-ink hover:text-white"
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
              "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-2 text-xs font-medium text-muted transition duration-200 ease-out active:scale-95",
              active ? "bg-orange-50 text-brand shadow-[inset_0_0_0_1px_rgba(249,115,22,0.16)]" : "hover:bg-slate-50 active:bg-orange-50"
            )}
          >
            <span className={clsx("flex size-5 items-center justify-center", active ? "text-brand" : "text-ink")}>{item.icon}</span>
            {item.label}
          </a>
        );
      })}
    </div>
  );
}

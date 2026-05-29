import { MobileNavLinks } from "@/components/layout/nav-links";

const navItems = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/coach", label: "Coach", icon: "✦" },
  { href: "/dashboard", label: "Rides", icon: "⌁" },
  { href: "/planner", label: "Plan", icon: "◎" },
  { href: "/me", label: "Me", icon: "◌" }
];

export function MobileTabNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-2 pt-1 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <MobileNavLinks items={navItems} />
    </nav>
  );
}

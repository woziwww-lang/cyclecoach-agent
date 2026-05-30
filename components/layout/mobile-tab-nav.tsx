import { MobileNavLinks } from "@/components/layout/nav-links";
import { CoachIcon, DashboardIcon, HomeIcon, PlannerIcon, UserSettingsIcon } from "@/components/ui/icons";

const navItems = [
  { href: "/", label: "Home", icon: <HomeIcon className="size-5" /> },
  { href: "/coach", label: "Coach", icon: <CoachIcon className="size-5" /> },
  { href: "/dashboard", label: "Rides", icon: <DashboardIcon className="size-5" /> },
  { href: "/planner", label: "Plan", icon: <PlannerIcon className="size-5" /> },
  { href: "/me", label: "Me", icon: <UserSettingsIcon className="size-5" /> }
];

export function MobileTabNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-2 pt-1 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <MobileNavLinks items={navItems} />
    </nav>
  );
}

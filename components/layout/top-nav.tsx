import { getServerI18n } from "@/lib/i18n/server";
import { DesktopNavLinks } from "@/components/layout/nav-links";
import { BikeBoltIcon } from "@/components/ui/icons";

export async function TopNav() {
  const { user, dictionary } = await getServerI18n();
  const navItems = [
    { href: "/", label: dictionary.nav.home },
    { href: "/coach", label: dictionary.nav.coach },
    { href: "/dashboard", label: dictionary.nav.dashboard },
    { href: "/planner", label: dictionary.nav.planner },
    { href: "/me", label: dictionary.nav.me }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-ink text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
            <BikeBoltIcon className="size-5" />
          </span>
          <span className="hidden sm:inline">CycleCoach</span>
        </a>
        <DesktopNavLinks items={navItems} />
        {user ? (
          <form action="/api/auth/logout" method="post" className="hidden items-center gap-2 text-sm md:flex">
            <span className="max-w-36 truncate text-muted">{user.name ?? user.email ?? "Rider"}</span>
            <button type="submit" className="rounded-full bg-slate-900 px-3 py-1.5 font-semibold text-white transition duration-200 ease-out hover:bg-slate-700 active:scale-[0.98]">{dictionary.nav.logout}</button>
          </form>
        ) : (
          <div className="hidden items-center gap-2 text-sm md:flex">
            <a href="/login" className="rounded-full px-3 py-1.5 font-medium text-muted transition duration-200 ease-out hover:bg-slate-100 hover:text-ink">{dictionary.nav.login}</a>
            <a href="/register" className="rounded-full bg-slate-900 px-3 py-1.5 font-semibold text-white transition duration-200 ease-out hover:bg-slate-700 active:scale-[0.98]">{dictionary.nav.signup}</a>
          </div>
        )}
      </nav>
    </header>
  );
}

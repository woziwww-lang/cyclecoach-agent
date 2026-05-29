import { getServerI18n } from "@/lib/i18n/server";

export async function TopNav() {
  const { user, dictionary } = await getServerI18n();
  const navItems = [
    { href: "/", label: dictionary.nav.home },
    { href: "/coach", label: dictionary.nav.coach },
    { href: "/dashboard", label: dictionary.nav.dashboard },
    { href: "/me", label: dictionary.nav.me }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">CC</span>
          <span>CycleCoach</span>
        </a>
        <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 text-sm text-muted md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="rounded-full px-3 py-1.5 transition hover:bg-white hover:text-ink hover:shadow-sm">
              {item.label}
            </a>
          ))}
        </div>
        {user ? (
          <form action="/api/auth/logout" method="post" className="hidden items-center gap-2 text-sm md:flex">
            <span className="max-w-36 truncate text-muted">{user.name ?? user.email ?? "Rider"}</span>
            <button className="rounded-full bg-slate-900 px-3 py-1.5 font-semibold text-white transition hover:bg-slate-700">{dictionary.nav.logout}</button>
          </form>
        ) : (
          <div className="hidden items-center gap-2 text-sm md:flex">
            <a href="/login" className="rounded-full px-3 py-1.5 font-medium text-muted transition hover:bg-slate-100 hover:text-ink">{dictionary.nav.login}</a>
            <a href="/register" className="rounded-full bg-slate-900 px-3 py-1.5 font-semibold text-white transition hover:bg-slate-700">{dictionary.nav.signup}</a>
          </div>
        )}
      </nav>
    </header>
  );
}

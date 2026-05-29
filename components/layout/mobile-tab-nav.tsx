const navItems = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/coach", label: "Coach", icon: "✦" },
  { href: "/dashboard", label: "Rides", icon: "⌁" },
  { href: "/me", label: "Me", icon: "◌" }
];

export function MobileTabNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-2 pt-1 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => (
          <a key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-xs font-medium text-muted transition active:scale-95 active:bg-orange-50">
            <span className="text-lg leading-none text-ink">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

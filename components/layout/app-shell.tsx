import { QueryProvider } from "@/lib/query/query-provider";
import { MobileTabNav } from "@/components/layout/mobile-tab-nav";
import { TopNav } from "@/components/layout/top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-page pb-20 text-ink md:pb-0">
        <TopNav />
        {children}
        <MobileTabNav />
      </div>
    </QueryProvider>
  );
}

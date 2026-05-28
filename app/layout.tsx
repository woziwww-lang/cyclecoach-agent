import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CycleCoach Agent",
  description: "Strava-first AI cycling coach MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-page">
          <header className="border-b bg-white">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <a href="/" className="text-lg font-semibold">
                CycleCoach Agent
              </a>
              <div className="flex gap-4 text-sm text-muted">
                <a href="/dashboard">Dashboard</a>
                <a href="/activities">Activities</a>
              </div>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

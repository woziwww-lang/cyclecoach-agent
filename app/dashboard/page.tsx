import { Suspense } from "react";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { LoadingCard } from "@/components/ui/loading-card";

export default async function DashboardPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-7xl px-4 py-8"><LoadingCard label="Loading dashboard" /></main>}>
      <DashboardClient />
    </Suspense>
  );
}

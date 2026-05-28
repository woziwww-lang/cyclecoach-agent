import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatDistanceKm, formatDuration } from "@/lib/format";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const activities = await prisma.stravaActivity.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "desc" },
    take: 5
  });

  const totalKm = activities.reduce((sum, a) => sum + (a.distanceMeters ?? 0) / 1000, 0);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted">Latest synced cycling activities from Strava.</p>
        </div>
        <form action="/api/strava/sync" method="post">
          <button className="rounded-md bg-brand px-4 py-2 font-medium text-white">Sync latest 30</button>
        </form>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-soft">
          <p className="text-sm text-muted">Cached rides</p>
          <p className="mt-2 text-3xl font-semibold">{activities.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-soft">
          <p className="text-sm text-muted">Visible distance</p>
          <p className="mt-2 text-3xl font-semibold">{totalKm.toFixed(1)} km</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-soft">
          <p className="text-sm text-muted">AI mode</p>
          <p className="mt-2 text-3xl font-semibold">Ollama</p>
        </div>
      </section>

      <section className="rounded-lg border bg-white shadow-soft">
        <div className="border-b p-4">
          <h2 className="font-semibold">Recent activities</h2>
        </div>
        <div className="divide-y">
          {activities.length === 0 ? (
            <div className="p-4 text-muted">No activities yet. Sync Strava to load your latest rides.</div>
          ) : (
            activities.map((activity) => (
              <a key={activity.id} className="block p-4 hover:bg-orange-50" href={`/activities/${activity.id}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-muted">{activity.startDate.toLocaleDateString()}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{formatDistanceKm(activity.distanceMeters)}</p>
                    <p className="text-muted">{formatDuration(activity.movingTimeSec)}</p>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

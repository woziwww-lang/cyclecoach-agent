import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ActivityCard } from "@/components/activity/activity-card";

export default async function ActivitiesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const activities = await prisma.stravaActivity.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "desc" },
    take: 30
  });

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Activities</h1>
          <p className="text-muted">Cycling activities cached from Strava.</p>
        </div>
        <form action="/api/strava/sync" method="post">
          <button className="rounded-md bg-brand px-4 py-2 font-medium text-white">Sync latest 30</button>
        </form>
      </div>

      <div className="grid gap-3">
        {activities.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center text-muted">
            No rides found. Click sync to fetch recent Strava cycling activities.
          </div>
        ) : (
          activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)
        )}
      </div>
    </main>
  );
}

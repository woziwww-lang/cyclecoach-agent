import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ActivityMetricCards } from "@/components/activity/activity-metric-cards";
import { ActivityMap } from "@/components/map/activity-map";
import { AnalysisPanel } from "@/components/activity/analysis-panel";
import { StreamSummary } from "@/components/charts/stream-summary";
import { buttonClassName } from "@/components/ui/button";

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { id } = await params;
  const activity = await prisma.stravaActivity.findFirst({
    where: { id, userId: user.id },
    include: {
      stream: true,
      analyses: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  if (!activity) notFound();

  return (
    <main className="cc-container space-y-5">
      <div className="cc-card-muted flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <a className="text-sm font-semibold text-brand" href="/dashboard">Back to dashboard</a>
          <h1 className="mt-1 text-3xl font-semibold">{activity.name}</h1>
          <p className="text-muted">{activity.startDate.toLocaleString()}</p>
        </div>
        <form action={`/api/strava/activities/${activity.id}`} method="post">
          <button type="submit" className={buttonClassName("secondary")}>Refresh detail & streams</button>
        </form>
      </div>

      <ActivityMetricCards activity={activity} />
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <section className="space-y-5">
          <ActivityMap polyline={activity.summaryPolyline} stream={activity.stream} title="Ride route" />
          <StreamSummary stream={activity.stream} />
        </section>
        <AnalysisPanel activityId={activity.id} latestAnalysis={activity.analyses[0] ?? null} />
      </div>
    </main>
  );
}

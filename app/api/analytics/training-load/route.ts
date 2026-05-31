import { NextResponse } from "next/server";
import { buildElevationTrend, buildWeeklyTrainingLoad, getRecentRideActivities } from "@/features/analytics/services/training-load-service";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const activities = await getRecentRideActivities(user.id);
  return NextResponse.json({
    weeklyLoad: buildWeeklyTrainingLoad(activities),
    elevationTrend: buildElevationTrend(activities)
  });
}

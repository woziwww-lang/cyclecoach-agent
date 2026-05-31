import { NextResponse } from "next/server";
import { buildRiderProfile } from "@/features/analytics/services/rider-profile-service";
import { getRecentRideActivities } from "@/features/analytics/services/training-load-service";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const activities = await getRecentRideActivities(user.id);
  return NextResponse.json({ riderProfile: buildRiderProfile(activities), persisted: false });
}

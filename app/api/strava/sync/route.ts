import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getValidStravaAccessToken, syncRecentCyclingActivities } from "@/lib/strava/sync";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  try {
    const accessToken = await getValidStravaAccessToken(user.id);
    await syncRecentCyclingActivities(user.id, accessToken);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }

  redirect("/activities");
}

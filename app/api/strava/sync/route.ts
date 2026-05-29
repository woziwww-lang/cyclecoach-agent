import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getValidStravaAccessToken, syncRecentCyclingActivities } from "@/lib/strava/sync";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  try {
    const accessToken = await getValidStravaAccessToken(user.id);
    const result = await syncRecentCyclingActivities(user.id, accessToken);
    const accept = request.headers.get("accept") ?? "";
    if (accept.includes("text/html")) {
      return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
    }
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { exchangeStravaCode } from "@/lib/strava/oauth";
import { upsertStravaConnection } from "@/lib/strava/sync";
import { getCurrentUser, setUserCookie } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get("strava_oauth_state")?.value;

  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(new URL("/?error=strava_oauth_state", request.url));
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.redirect(new URL("/login?error=strava_requires_login", request.url));
  }

  try {
    const token = await exchangeStravaCode(code);
    const { user } = await upsertStravaConnection(token, currentUser.id);
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    setUserCookie(response, user.id);
    response.cookies.delete("strava_oauth_state");
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/?error=strava_oauth_failed", request.url));
  }
}

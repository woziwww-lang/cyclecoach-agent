import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { fetchAndCacheActivityDetailAndStreams } from "@/lib/strava/sync";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;
  const activity = await fetchAndCacheActivityDetailAndStreams(user.id, id);
  return NextResponse.json({ activity });
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;
  const activity = await fetchAndCacheActivityDetailAndStreams(user.id, id);
  const accept = _request.headers.get("accept") ?? "";
  if (accept.includes("application/json")) {
    return NextResponse.json({ activity });
  }
  redirect(`/activities/${id}`);
}

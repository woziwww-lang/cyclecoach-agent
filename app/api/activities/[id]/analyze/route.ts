import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { analyzeActivity } from "@/lib/analysis/activity-analysis";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;
  try {
    const analysis = await analyzeActivity(user.id, id);
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

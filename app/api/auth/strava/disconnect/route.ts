import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  await prisma.connectedAccount.deleteMany({
    where: { userId: user.id, provider: "strava" }
  });

  return NextResponse.json({ ok: true });
}

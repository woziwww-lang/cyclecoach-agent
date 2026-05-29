import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ connected: false, account: null });

  const account = await prisma.connectedAccount.findFirst({
    where: { userId: user.id, provider: "strava", status: "connected" },
    select: {
      displayName: true,
      lastSyncedAt: true,
      status: true
    }
  });

  return NextResponse.json({
    connected: Boolean(account),
    account
  });
}

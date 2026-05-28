import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const activities = await prisma.stravaActivity.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "desc" },
    take: 30
  });

  return NextResponse.json({ activities });
}

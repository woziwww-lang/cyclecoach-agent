import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { id } = await params;
  const analysis = await prisma.activityAnalysis.findFirst({
    where: { activityId: id, userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ analysis });
}

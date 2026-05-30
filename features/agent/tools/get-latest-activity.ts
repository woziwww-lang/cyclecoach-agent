import { prisma } from "@/lib/db/prisma";

export async function getLatestActivity(userId: string) {
  return prisma.stravaActivity.findFirst({
    where: { userId },
    orderBy: { startDate: "desc" }
  });
}

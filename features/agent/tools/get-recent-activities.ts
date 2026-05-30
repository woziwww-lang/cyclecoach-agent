import { prisma } from "@/lib/db/prisma";

export async function getRecentActivities(userId: string, days = 30, limit = 80) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return prisma.stravaActivity.findMany({
    where: { userId, startDate: { gte: since } },
    orderBy: { startDate: "desc" },
    take: limit
  });
}

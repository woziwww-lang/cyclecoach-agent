import type { StravaActivity } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { WeeklyTrainingLoadPoint } from "@/features/analytics/schemas/rider-profile.schema";

export async function getRecentRideActivities(userId: string, limit = 80) {
  return prisma.stravaActivity.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
    take: limit
  });
}

export function buildWeeklyTrainingLoad(activities: StravaActivity[]): WeeklyTrainingLoadPoint[] {
  const weeks = new Map<string, WeeklyTrainingLoadPoint>();
  for (const activity of activities) {
    const key = weekKey(activity.startDate);
    const current = weeks.get(key) ?? { week: key, distanceKm: 0, elevationM: 0, movingHours: 0, rideCount: 0 };
    current.distanceKm += (activity.distanceMeters ?? 0) / 1000;
    current.elevationM += activity.totalElevationGain ?? 0;
    current.movingHours += (activity.movingTimeSec ?? 0) / 3600;
    current.rideCount += 1;
    weeks.set(key, current);
  }
  return [...weeks.values()]
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-8)
    .map((point) => ({
      ...point,
      distanceKm: round(point.distanceKm),
      elevationM: Math.round(point.elevationM),
      movingHours: round(point.movingHours)
    }));
}

export function buildElevationTrend(activities: StravaActivity[]) {
  return [...activities]
    .reverse()
    .slice(-12)
    .map((activity) => ({
      label: shortDate(activity.startDate),
      elevationM: Math.round(activity.totalElevationGain ?? 0)
    }));
}

function weekKey(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() + 1 - day);
  return `${copy.getFullYear()}-${String(copy.getMonth() + 1).padStart(2, "0")}-${String(copy.getDate()).padStart(2, "0")}`;
}

function shortDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

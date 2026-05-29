import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { OllamaProvider } from "@/lib/ai/ollama";
import { getEffectiveOllamaConfig } from "@/lib/settings/user-settings";
import { generateRidePlan } from "@/features/planner/services/ride-plan-generator";
import { RecentTrainingSummarySchema, RidePlanInputSchema, type RecentTrainingSummary } from "@/features/planner/schemas/ride-plan.schema";

export async function POST(request: Request) {
  const input = RidePlanInputSchema.parse(await request.json());
  const user = await getCurrentUser();
  const recentTraining = input.useLatestRideContext && user ? await getRecentTrainingSummary(user.id) : emptyRecentTraining();
  let plan = generateRidePlan(input, recentTraining);
  let fallbackUsed = false;
  let model: string | null = null;

  try {
    const config = await getEffectiveOllamaConfig(user?.id);
    model = config.model;
    const provider = new OllamaProvider(config.baseUrl, config.model);
    const coachSummary = await provider.generateText({
      system: "You are Coach Agent, a concise cycling coach. Do not invent data. This is training guidance, not medical advice.",
      prompt: buildPlannerPrompt({ input, recentTraining, plan })
    });
    if (coachSummary.trim()) {
      plan = { ...plan, coachSummary: coachSummary.trim().slice(0, 900) };
    }
  } catch {
    fallbackUsed = true;
    plan = { ...plan, fallbackUsed: true };
  }

  return NextResponse.json({ plan, recentTraining, model, fallbackUsed });
}

async function getRecentTrainingSummary(userId: string): Promise<RecentTrainingSummary> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activities = await prisma.stravaActivity.findMany({
    where: { userId, startDate: { gte: since } },
    orderBy: { startDate: "desc" },
    take: 20
  });
  const latest = await prisma.stravaActivity.findFirst({
    where: { userId },
    orderBy: { startDate: "desc" }
  });

  const summary = {
    hasData: Boolean(latest),
    latestRideName: latest?.name ?? null,
    latestRideDate: latest?.startDate.toISOString() ?? null,
    sevenDayDistanceKm: activities.reduce((sum, activity) => sum + (activity.distanceMeters ?? 0), 0) / 1000,
    sevenDayElevationM: activities.reduce((sum, activity) => sum + (activity.totalElevationGain ?? 0), 0),
    sevenDayMovingHours: activities.reduce((sum, activity) => sum + (activity.movingTimeSec ?? 0), 0) / 3600,
    possibleHighIntensity: activities.some((activity) => (activity.averageHeartrate ?? 0) >= 155 || (activity.averageWatts ?? 0) >= 180)
  };

  return RecentTrainingSummarySchema.parse(summary);
}

function emptyRecentTraining(): RecentTrainingSummary {
  return {
    hasData: false,
    latestRideName: null,
    latestRideDate: null,
    sevenDayDistanceKm: 0,
    sevenDayElevationM: 0,
    sevenDayMovingHours: 0,
    possibleHighIntensity: false
  };
}

function buildPlannerPrompt(input: { input: unknown; recentTraining: RecentTrainingSummary; plan: unknown }) {
  return `Rewrite the rule-based ride plan into one short coach summary.

Return plain text only, 3-5 sentences.

Manual inputs:
${JSON.stringify(input.input)}

Recent training summary:
${JSON.stringify(input.recentTraining)}

Rule-based plan:
${JSON.stringify(input.plan)}

Rules:
- Do not invent FTP, heart-rate zones, power zones, route, weather, or medical claims.
- If recent training has no data, say this is based on manual inputs.
- Keep it practical and encouraging, but not fluffy.
- Include the not-medical-advice boundary briefly if relevant.`;
}

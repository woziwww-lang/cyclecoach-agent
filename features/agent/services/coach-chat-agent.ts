import { z } from "zod";
import { OllamaProvider } from "@/lib/ai/ollama";
import { getEffectiveOllamaConfig } from "@/lib/settings/user-settings";
import { prisma } from "@/lib/db/prisma";
import { buildTrainingMemory, emptyTrainingMemory } from "@/features/agent/memory/build-training-memory";
import { buildCoachSystemPrompt } from "@/features/agent/prompts/coach-system.prompt";
import { buildCoachChatPrompt } from "@/features/agent/prompts/chat.prompt";

export const CoachChatInputSchema = z.object({
  message: z.string().min(1).max(1200),
  activityId: z.string().nullable().optional()
});

export async function runCoachChatAgent(input: unknown, userId?: string | null) {
  const parsed = CoachChatInputSchema.parse(input);
  const trainingMemory = userId ? await buildTrainingMemory(userId) : emptyTrainingMemory();
  const selectedActivityContext =
    userId && parsed.activityId
      ? await prisma.stravaActivity.findFirst({
          where: { id: parsed.activityId, userId },
          select: {
            id: true,
            name: true,
            sportType: true,
            startDate: true,
            distanceMeters: true,
            movingTimeSec: true,
            totalElevationGain: true,
            averageSpeed: true,
            averageHeartrate: true,
            averageWatts: true,
            weightedAverageWatts: true,
            summaryPolyline: true
          }
        })
      : null;

  const config = await getEffectiveOllamaConfig(userId ?? undefined);
  let message: string;
  let fallbackUsed = false;

  try {
    const provider = new OllamaProvider(config.baseUrl, config.model);
    message = await provider.generateText({
      system: buildCoachSystemPrompt(),
      prompt: buildCoachChatPrompt({
        message: parsed.message,
        trainingMemory,
        selectedActivityContext
      })
    });
  } catch (error) {
    fallbackUsed = true;
    message = buildCoachFallback(parsed.message, trainingMemory, String(error));
  }

  return {
    message,
    fallbackUsed,
    model: config.model,
    memoryUsed: Boolean(userId)
  };
}

function buildCoachFallback(question: string, memory: Awaited<ReturnType<typeof buildTrainingMemory>>, reason: string) {
  const latest = memory.latestRide ? `Your latest ride was ${memory.latestRide.name}: ${memory.latestRide.distanceKm} km and ${memory.latestRide.elevationM} m.` : "I do not see a recent ride.";
  const routes = memory.routeMemory.length
    ? `A familiar route option from your history is ${memory.routeMemory[0].name}.`
    : "I do not see a mapped route history yet.";

  return `I could not reach the local model, so here is a conservative rule-based answer.

Question: ${question}

${latest}
Last 7 days: ${memory.last7Days.distanceKm} km, ${memory.last7Days.elevationM} m elevation, ${Math.round(memory.last7Days.movingTimeMinutes / 60)} h.
${routes}

If you feel tired or your recent week is climbing-heavy, choose an easy recovery ride or rest. If you feel normal, a steady endurance ride on a familiar low-risk route is the safest default.

Missing context: ${memory.missingData.join("; ") || "none obvious from cached activities"}.

Local model note: ${reason}

This is training guidance, not medical advice.`;
}

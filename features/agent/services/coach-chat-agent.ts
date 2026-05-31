import { z } from "zod";
import { OllamaProvider } from "@/lib/ai/ollama";
import { getEffectiveOllamaConfig } from "@/lib/settings/user-settings";
import { prisma } from "@/lib/db/prisma";
import { buildTrainingMemory, emptyTrainingMemory } from "@/features/agent/memory/build-training-memory";
import { buildCoachSystemPrompt } from "@/features/agent/prompts/coach-system.prompt";
import { buildCoachChatPrompt } from "@/features/agent/prompts/chat.prompt";
import { CoachResponseSchema, type CoachResponse } from "@/features/agent/schemas/coach-response.schema";
import { parseJsonWithSchema } from "@/features/agent/services/safe-ai-parser";

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
  let structured: CoachResponse;
  let fallbackUsed = false;

  try {
    const provider = new OllamaProvider(config.baseUrl, config.model);
    const text = await provider.generateText({
      system: buildCoachSystemPrompt(),
      prompt: buildCoachChatPrompt({
        message: parsed.message,
        trainingMemory,
        selectedActivityContext
      })
    });
    const fallback = buildCoachStructuredFallback(parsed.message, trainingMemory, null);
    structured = parseJsonWithSchema(text, CoachResponseSchema, fallback);
    fallbackUsed = structured === fallback;
    message = renderCoachResponseText(structured);
  } catch (error) {
    fallbackUsed = true;
    structured = buildCoachStructuredFallback(parsed.message, trainingMemory, String(error));
    message = renderCoachResponseText(structured);
  }

  return {
    message,
    structured,
    fallbackUsed,
    model: config.model,
    memoryUsed: Boolean(userId)
  };
}

function buildCoachStructuredFallback(question: string, memory: Awaited<ReturnType<typeof buildTrainingMemory>>, reason: string | null): CoachResponse {
  const latest = memory.latestRide
    ? `Latest ride: ${memory.latestRide.name}, ${memory.latestRide.distanceKm} km and ${memory.latestRide.elevationM} m.`
    : "No recent ride is available.";
  const route = memory.routeMemory[0]?.name ? `A familiar route option is ${memory.routeMemory[0].name}.` : "No mapped route history is available yet.";

  return {
    directAnswer: `For "${question}", use a conservative plan unless your recent data clearly supports more intensity.`,
    basedOnRecentRides: [
      latest,
      `Last 7 days: ${memory.last7Days.distanceKm} km, ${memory.last7Days.elevationM} m elevation, ${Math.round(memory.last7Days.movingTimeMinutes / 60)} h.`,
      route
    ],
    recommendation: [
      memory.fatigueSignals.length ? "Choose recovery or rest before adding intensity." : "Default to a steady endurance ride if you feel normal.",
      "Keep the effort controlled and stop early if legs or breathing feel unusually poor."
    ],
    why: [
      memory.fatigueSignals.length ? "Recent fatigue signals reduce confidence in hard training." : "Steady aerobic work is the safest useful default with limited context."
    ],
    whatToWatch: ["Weather, daylight, traffic, hydration, and any unusual physical symptoms."],
    nextAction: "If you want a concrete next ride, open Plan Next Ride and choose your time budget plus readiness.",
    confidence: {
      level: memory.latestRide ? "medium" : "low",
      reason: reason ? `Rule-based fallback used: ${reason}` : "Structured fallback used because the model response was not valid JSON."
    },
    missingData: memory.missingData,
    disclaimer: "Training guidance only. Not medical advice."
  };
}

function renderCoachResponseText(response: CoachResponse) {
  return [
    `Direct answer: ${response.directAnswer}`,
    `Recommendation: ${response.recommendation.join(" ")}`,
    `Next action: ${response.nextAction}`,
    `Confidence: ${response.confidence.level} - ${response.confidence.reason}`,
    response.disclaimer
  ].join("\n\n");
}

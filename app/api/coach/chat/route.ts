import { NextResponse } from "next/server";
import { z } from "zod";
import { OllamaProvider } from "@/lib/ai/ollama";
import { buildCoachSystemPrompt, buildGeneralCoachPrompt } from "@/lib/ai/prompts";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getEffectiveOllamaConfig } from "@/lib/settings/user-settings";

const ChatSchema = z.object({
  message: z.string().min(1).max(1200),
  activityId: z.string().nullable().optional()
});

export async function POST(request: Request) {
  const input = ChatSchema.parse(await request.json());
  const user = await getCurrentUser();
  const config = await getEffectiveOllamaConfig(user?.id);

  const activityContext =
    user && input.activityId
      ? await prisma.stravaActivity.findFirst({
          where: { id: input.activityId, userId: user.id },
          select: {
            name: true,
            sportType: true,
            startDate: true,
            distanceMeters: true,
            movingTimeSec: true,
            totalElevationGain: true,
            averageSpeed: true,
            averageHeartrate: true,
            averageWatts: true,
            weightedAverageWatts: true
          }
        })
      : null;

  let message: string;
  let fallbackUsed = false;

  try {
    const provider = new OllamaProvider(config.baseUrl, config.model);
    message = await provider.generateText({
      system: buildCoachSystemPrompt(),
      prompt: buildGeneralCoachPrompt({
        message: input.message,
        activityContext
      })
    });
  } catch (error) {
    fallbackUsed = true;
    message = buildCoachFallback(input.message, String(error));
  }

  if (user) {
    const conversation = await prisma.coachConversation.create({
      data: {
        userId: user.id,
        title: input.message.slice(0, 80),
        messages: {
          create: [
            { role: "user", content: input.message },
            { role: "assistant", content: message }
          ]
        }
      }
    });
    void conversation;
  }

  return NextResponse.json({
    message,
    fallbackUsed,
    model: config.model
  });
}

function buildCoachFallback(question: string, reason: string) {
  return `I could not reach the local model, so here is a conservative rule-based answer.

Question: ${question}

Keep the next session easy if you feel unusually tired, sore, or under-recovered. For cycling fitness, a safe default is 45-90 minutes of conversational endurance riding, then add harder work only when recovery is good and recent training has been consistent.

Missing context: recent training load, heart-rate/power zones, sleep, soreness, and your exact goal.

Local model note: ${reason}

This is training guidance, not medical advice.`;
}

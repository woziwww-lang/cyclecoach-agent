import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { CoachChatInputSchema, runCoachChatAgent } from "@/features/agent/services/coach-chat-agent";

export async function POST(request: Request) {
  const input = CoachChatInputSchema.parse(await request.json());
  const user = await getCurrentUser();
  const response = await runCoachChatAgent(input, user?.id);

  if (user) {
    await prisma.coachConversation.create({
      data: {
        userId: user.id,
        title: input.message.slice(0, 80),
        messages: {
          create: [
            { role: "user", content: input.message },
            { role: "assistant", content: response.message }
          ]
        }
      }
    });
  }

  return NextResponse.json(response);
}

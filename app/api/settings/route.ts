import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrCreateUserSettings } from "@/lib/settings/user-settings";
import { prisma } from "@/lib/db/prisma";

const SettingsPatchSchema = z.object({
  language: z.enum(["en", "zh", "ja"]).optional(),
  llmProvider: z.literal("ollama").optional(),
  ollamaBaseUrl: z.string().url().optional(),
  ollamaModel: z.string().min(1).max(80).optional(),
  preferredUnits: z.enum(["metric", "imperial"]).optional()
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const settings = await getOrCreateUserSettings(user.id);
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const input = SettingsPatchSchema.parse(await request.json());
  await getOrCreateUserSettings(user.id);
  const settings = await prisma.userSettings.update({
    where: { userId: user.id },
    data: input
  });

  return NextResponse.json({ settings });
}

import { NextResponse } from "next/server";
import { getOllamaHealth } from "@/lib/ai/ollama";
import { getCurrentUser } from "@/lib/auth/session";
import { getEffectiveOllamaConfig } from "@/lib/settings/user-settings";

export async function GET() {
  const user = await getCurrentUser();
  const ollama = await getOllamaHealth(await getEffectiveOllamaConfig(user?.id));
  return NextResponse.json({
    ok: true,
    ollama,
    time: new Date().toISOString()
  });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getOllamaHealth } from "@/lib/ai/ollama";
import { getEffectiveOllamaConfig } from "@/lib/settings/user-settings";

export async function GET() {
  const user = await getCurrentUser();
  const config = await getEffectiveOllamaConfig(user?.id);
  const ollama = await getOllamaHealth(config);
  return NextResponse.json({
    ok: ollama.ok,
    ollama
  });
}

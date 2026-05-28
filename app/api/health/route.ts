import { NextResponse } from "next/server";
import { getOllamaHealth } from "@/lib/ai/ollama";

export async function GET() {
  const ollama = await getOllamaHealth();
  return NextResponse.json({
    ok: true,
    ollama,
    time: new Date().toISOString()
  });
}

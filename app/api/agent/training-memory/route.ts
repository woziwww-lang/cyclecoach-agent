import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { buildTrainingMemory, emptyTrainingMemory } from "@/features/agent/memory/build-training-memory";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ trainingMemory: emptyTrainingMemory(), authenticated: false });

  const trainingMemory = await buildTrainingMemory(user.id);
  return NextResponse.json({ trainingMemory, authenticated: true });
}

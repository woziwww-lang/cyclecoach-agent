import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { runPlannerAgent } from "@/features/agent/services/planner-agent";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const response = await runPlannerAgent(await request.json(), user?.id);
  return NextResponse.json(response);
}

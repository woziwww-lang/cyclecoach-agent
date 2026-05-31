import { NextResponse } from "next/server";
import { RidePlanInputSchema } from "@/features/agent/schemas/ride-plan.schema";
import { buildTrainingMemory, emptyTrainingMemory } from "@/features/agent/memory/build-training-memory";
import { getRouteCandidates } from "@/features/routes/services/route-candidate-service";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  const input = RidePlanInputSchema.parse({
    durationMinutes: 90,
    goal: "endurance",
    readiness: "normal",
    routePreference: "not_sure",
    useLatestRideContext: Boolean(user?.id)
  });
  const memory = user?.id ? await buildTrainingMemory(user.id) : emptyTrainingMemory();
  const routes = await getRouteCandidates(input, memory, user?.id);
  return NextResponse.json({
    routes,
    externalSearchConfigured: Boolean(process.env.ORS_API_KEY),
    fallbackUsed: routes.every((route) => route.source !== "external_api")
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const input = RidePlanInputSchema.parse(await request.json());
  const memory = user?.id && input.useLatestRideContext ? await buildTrainingMemory(user.id) : emptyTrainingMemory();
  const routes = await getRouteCandidates(input, memory, user?.id);
  return NextResponse.json({
    routes,
    externalSearchConfigured: Boolean(process.env.ORS_API_KEY),
    fallbackUsed: routes.every((route) => route.source !== "external_api")
  });
}

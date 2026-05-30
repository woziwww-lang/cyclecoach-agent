import { OllamaProvider } from "@/lib/ai/ollama";
import { getEffectiveOllamaConfig } from "@/lib/settings/user-settings";
import { getRouteCatalog } from "@/features/agent/data/route-catalog";
import { buildTrainingMemory, emptyTrainingMemory } from "@/features/agent/memory/build-training-memory";
import { buildCoachSystemPrompt } from "@/features/agent/prompts/coach-system.prompt";
import { buildPlannerPrompt } from "@/features/agent/prompts/planner.prompt";
import { RidePlanInputSchema, RidePlanSchema, type PlannerAgentResponse, type RidePlan } from "@/features/agent/schemas/ride-plan.schema";
import { getRecentActivities } from "@/features/agent/tools/get-recent-activities";
import { extractRouteHistory } from "@/features/agent/tools/extract-route-history";
import { generateDeterministicRidePlan } from "@/features/agent/tools/generate-deterministic-ride-plan";
import { matchRouteCandidates } from "@/features/agent/tools/match-route-candidates";

export async function runPlannerAgent(input: unknown, userId?: string | null): Promise<PlannerAgentResponse> {
  const userInput = RidePlanInputSchema.parse(input);
  const hasUserMemory = Boolean(userId && userInput.useLatestRideContext);
  const trainingMemory = hasUserMemory ? await buildTrainingMemory(userId as string) : emptyTrainingMemory();
  const recentActivities = hasUserMemory ? await getRecentActivities(userId as string, 30, 80) : [];
  const routeHistory = extractRouteHistory(recentActivities);
  const routeCandidates = matchRouteCandidates(userInput, trainingMemory, routeHistory, getRouteCatalog());
  let plan = generateDeterministicRidePlan(userInput, trainingMemory, routeCandidates);
  let fallbackUsed = false;
  let model: string | null = null;

  try {
    const config = await getEffectiveOllamaConfig(userId ?? undefined);
    model = config.model;
    const provider = new OllamaProvider(config.baseUrl, config.model);
    const text = await provider.generateText({
      system: buildCoachSystemPrompt(),
      prompt: buildPlannerPrompt({
        userInput,
        trainingMemory,
        routeCandidates,
        deterministicPlan: plan
      })
    });
    plan = parseRidePlanResponse(text, plan);
  } catch {
    fallbackUsed = true;
    plan = { ...plan, fallbackUsed: true };
  }

  return {
    plan,
    trainingMemory,
    routeCandidates,
    model,
    fallbackUsed
  };
}

function parseRidePlanResponse(text: string, fallback: RidePlan): RidePlan {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return fallback;
  try {
    return RidePlanSchema.parse(JSON.parse(trimmed.slice(start, end + 1)));
  } catch {
    return fallback;
  }
}

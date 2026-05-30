import type { RidePlan, RidePlanInput } from "@/features/agent/schemas/ride-plan.schema";
import type { RouteCandidate } from "@/features/agent/schemas/route-candidate.schema";
import type { TrainingMemory } from "@/features/agent/schemas/training-memory.schema";

export function buildPlannerPrompt(input: {
  userInput: RidePlanInput;
  trainingMemory: TrainingMemory;
  routeCandidates: RouteCandidate[];
  deterministicPlan: RidePlan;
}) {
  return `Refine this deterministic cycling ride plan.

Return ONLY valid JSON matching the deterministic plan shape. Preserve all factual fields unless you are improving wording. Do not invent data.

User intent:
${JSON.stringify(input.userInput)}

Compact recent training memory:
${JSON.stringify(input.trainingMemory)}

Top route candidates:
${JSON.stringify(input.routeCandidates.slice(0, 3))}

Deterministic plan:
${JSON.stringify(input.deterministicPlan)}

Rules:
- Keep the recommended route specific.
- If source is previous_activity, explain it is based on a previous Strava route.
- If source is route_catalog, explain it is catalog-based and not from user history.
- If fatigueSignals is non-empty, keep recovery/caution language.
- Do not invent FTP, heart-rate zones, power zones, weather, or medical claims.
- Keep arrays concise.`;
}

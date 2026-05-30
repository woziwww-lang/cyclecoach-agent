import type { TrainingMemory } from "@/features/agent/schemas/training-memory.schema";

export function buildCoachChatPrompt(input: {
  message: string;
  trainingMemory: TrainingMemory;
  selectedActivityContext?: unknown;
}) {
  return `Answer the user's sports/cycling question using compact recent training memory when relevant.

User question:
${input.message}

Recent training memory:
${JSON.stringify(input.trainingMemory)}

Selected activity context:
${input.selectedActivityContext ? JSON.stringify(input.selectedActivityContext) : "none"}

Rules:
- Be specific when recent activity data supports it.
- If routeMemory contains suitable routes, mention route names when recommending where to ride.
- If data is missing, say confidence is lower.
- Do not invent route, weather, FTP, HR zones, power zones, or diagnosis.
- Keep the answer concise and practical.`;
}

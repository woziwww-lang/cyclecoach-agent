import type { TrainingMemory } from "@/features/agent/schemas/training-memory.schema";

export function buildCoachChatPrompt(input: {
  message: string;
  trainingMemory: TrainingMemory;
  selectedActivityContext?: unknown;
}) {
  return `Answer the user's sports/cycling question using compact recent training memory when relevant.

Return ONLY valid JSON with this shape:
{
  "directAnswer": "string",
  "basedOnRecentRides": ["string"],
  "recommendation": ["string"],
  "why": ["string"],
  "whatToWatch": ["string"],
  "nextAction": "string",
  "confidence": { "level": "high | medium | low", "reason": "string" },
  "missingData": ["string"],
  "disclaimer": "Training guidance only. Not medical advice."
}

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
- Keep each array to 1-3 concise bullets.
- For general cycling questions with no user data, put general guidance in directAnswer and practical steps in recommendation.`;
}

import { describe, expect, it } from "vitest";
import { CoachResponseSchema } from "@/features/agent/schemas/coach-response.schema";
import { parseJsonWithSchema } from "@/features/agent/services/safe-ai-parser";

const fallback = {
  directAnswer: "fallback",
  basedOnRecentRides: [],
  recommendation: [],
  why: [],
  whatToWatch: [],
  nextAction: "try again",
  confidence: { level: "low" as const, reason: "fallback" },
  missingData: [],
  disclaimer: "Training guidance only. Not medical advice."
};

describe("safe AI parser", () => {
  it("extracts valid JSON from model text", () => {
    const parsed = parseJsonWithSchema(`Here is JSON ${JSON.stringify({ ...fallback, directAnswer: "ok" })}`, CoachResponseSchema, fallback);
    expect(parsed.directAnswer).toBe("ok");
  });

  it("falls back on invalid JSON", () => {
    const parsed = parseJsonWithSchema("not json", CoachResponseSchema, fallback);
    expect(parsed).toBe(fallback);
  });
});

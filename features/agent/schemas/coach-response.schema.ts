import { z } from "zod";

export const CoachResponseSchema = z.object({
  directAnswer: z.string(),
  basedOnRecentRides: z.array(z.string()),
  recommendation: z.array(z.string()),
  why: z.array(z.string()),
  whatToWatch: z.array(z.string()),
  nextAction: z.string(),
  confidence: z.object({
    level: z.enum(["high", "medium", "low"]),
    reason: z.string()
  }),
  missingData: z.array(z.string()),
  disclaimer: z.string()
});

export type CoachResponse = z.infer<typeof CoachResponseSchema>;

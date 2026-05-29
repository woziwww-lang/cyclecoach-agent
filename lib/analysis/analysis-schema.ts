import { z } from "zod";

export const AnalysisResultSchema = z.object({
  overallVerdict: z.string(),
  effortType: z.enum(["recovery", "endurance", "tempo", "threshold", "vo2max", "climbing", "mixed", "unknown"]),
  keyMetrics: z.array(z.object({ label: z.string(), value: z.string(), note: z.string().optional() })),
  trainingMeaning: z.string(),
  wentWell: z.array(z.string()),
  toImprove: z.array(z.string()),
  nextRide: z.object({
    title: z.string(),
    details: z.string(),
    duration: z.string().optional(),
    intensity: z.string().optional()
  }),
  recovery: z.array(z.string()),
  confidence: z.object({
    level: z.enum(["high", "medium", "low"]),
    reason: z.string()
  }),
  missingData: z.array(z.string()),
  disclaimer: z.string(),
  fallbackUsed: z.boolean().optional()
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

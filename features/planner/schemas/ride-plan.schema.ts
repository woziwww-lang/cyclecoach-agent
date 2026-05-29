import { z } from "zod";

export const RidePlanInputSchema = z.object({
  durationMinutes: z.number().int().min(20).max(360),
  goal: z.enum(["recovery", "endurance", "climbing", "ftp", "fat_loss", "long_ride"]),
  readiness: z.enum(["fresh", "normal", "tired", "not_sure"]),
  useLatestRideContext: z.boolean()
});

export const RecentTrainingSummarySchema = z.object({
  hasData: z.boolean(),
  latestRideName: z.string().nullable(),
  latestRideDate: z.string().nullable(),
  sevenDayDistanceKm: z.number(),
  sevenDayElevationM: z.number(),
  sevenDayMovingHours: z.number(),
  possibleHighIntensity: z.boolean()
});

export const TrainingBlockSchema = z.object({
  title: z.string(),
  durationMinutes: z.number().int(),
  intensity: z.string(),
  description: z.string()
});

export const RidePlanSchema = z.object({
  title: z.string(),
  rideType: z.enum(["recovery", "endurance", "tempo", "climbing", "ftp", "long_ride", "rest"]),
  durationMinutes: z.number().int(),
  intensity: z.enum(["easy", "moderate", "hard"]),
  routeType: z.string(),
  warmup: z.object({
    durationMinutes: z.number().int(),
    description: z.string()
  }),
  mainSet: z.array(TrainingBlockSchema),
  cooldown: z.object({
    durationMinutes: z.number().int(),
    description: z.string()
  }),
  nutrition: z.array(z.string()),
  recovery: z.array(z.string()),
  safetyNotes: z.array(z.string()),
  coachSummary: z.string(),
  confidence: z.object({
    level: z.enum(["high", "medium", "low"]),
    reason: z.string()
  }),
  fallbackUsed: z.boolean().optional()
});

export type RidePlanInput = z.infer<typeof RidePlanInputSchema>;
export type RecentTrainingSummary = z.infer<typeof RecentTrainingSummarySchema>;
export type RidePlan = z.infer<typeof RidePlanSchema>;

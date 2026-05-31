import { z } from "zod";

export const RiderTypeSchema = z.enum(["climber", "sprinter", "endurance", "rouleur", "punchy", "base_builder", "unknown"]);

export const RiderProfileSchema = z.object({
  riderType: RiderTypeSchema,
  confidence: z.enum(["high", "medium", "low"]),
  scores: z.object({
    endurance: z.number(),
    climbing: z.number(),
    speed: z.number(),
    consistency: z.number(),
    intensity: z.number()
  }),
  evidence: z.array(z.string()),
  strengths: z.array(z.string()),
  limiters: z.array(z.string()),
  bestRoutes: z.array(z.string()),
  trainingFocus: z.array(z.string()),
  nextExperiment: z.string(),
  missingData: z.array(z.string())
});

export const WeeklyTrainingLoadPointSchema = z.object({
  week: z.string(),
  distanceKm: z.number(),
  elevationM: z.number(),
  movingHours: z.number(),
  rideCount: z.number()
});

export const AnalyticsDashboardSchema = z.object({
  riderProfile: RiderProfileSchema,
  weeklyLoad: z.array(WeeklyTrainingLoadPointSchema),
  elevationTrend: z.array(z.object({
    label: z.string(),
    elevationM: z.number()
  })),
  powerAvailable: z.boolean()
});

export type RiderProfile = z.infer<typeof RiderProfileSchema>;
export type WeeklyTrainingLoadPoint = z.infer<typeof WeeklyTrainingLoadPointSchema>;
export type AnalyticsDashboard = z.infer<typeof AnalyticsDashboardSchema>;

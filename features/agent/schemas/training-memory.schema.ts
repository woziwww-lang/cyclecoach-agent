import { z } from "zod";

export const RouteTypeSchema = z.enum(["flat", "rolling", "climbing", "endurance", "recovery", "mixed", "unknown"]);

export const CompactActivityMemorySchema = z.object({
  activityId: z.string(),
  name: z.string(),
  date: z.string(),
  distanceKm: z.number(),
  elevationM: z.number(),
  movingTimeMinutes: z.number(),
  avgHr: z.number().nullable(),
  avgPower: z.number().nullable(),
  routeType: RouteTypeSchema,
  hasPolyline: z.boolean(),
  polyline: z.string().nullable(),
  effortSummary: z.string()
});

export const TrainingWindowSummarySchema = z.object({
  rideCount: z.number().int(),
  distanceKm: z.number(),
  elevationM: z.number(),
  movingTimeMinutes: z.number(),
  notableLoad: z.string()
});

export const ThirtyDayTrainingSummarySchema = z.object({
  rideCount: z.number().int(),
  distanceKm: z.number(),
  elevationM: z.number(),
  movingTimeMinutes: z.number(),
  trendSummary: z.string()
});

export const TrainingMemorySchema = z.object({
  latestRide: CompactActivityMemorySchema.nullable(),
  last7Days: TrainingWindowSummarySchema,
  last30Days: ThirtyDayTrainingSummarySchema,
  routeMemory: z.array(CompactActivityMemorySchema),
  fatigueSignals: z.array(z.string()),
  missingData: z.array(z.string())
});

export type RouteType = z.infer<typeof RouteTypeSchema>;
export type CompactActivityMemory = z.infer<typeof CompactActivityMemorySchema>;
export type TrainingMemory = z.infer<typeof TrainingMemorySchema>;

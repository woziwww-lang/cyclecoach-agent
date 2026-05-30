import { z } from "zod";
import { PlannerGoalSchema, ReadinessSchema, RouteCandidateSchema, RoutePreferenceSchema } from "@/features/agent/schemas/route-candidate.schema";
import { RouteTypeSchema, TrainingMemorySchema } from "@/features/agent/schemas/training-memory.schema";

export const RidePlanInputSchema = z.object({
  durationMinutes: z.number().int().min(20).max(360),
  goal: PlannerGoalSchema,
  readiness: ReadinessSchema,
  routePreference: RoutePreferenceSchema.default("not_sure"),
  useLatestRideContext: z.boolean().default(true)
});

export const TrainingBlockSchema = z.object({
  title: z.string(),
  durationMinutes: z.number().int(),
  description: z.string(),
  intensity: z.string()
});

export const RidePlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  recommendedRoute: z.object({
    name: z.string(),
    source: z.enum(["previous_activity", "route_catalog", "manual_fallback"]),
    region: z.string().nullable(),
    routeType: RouteTypeSchema,
    estimatedDistanceKm: z.number().nullable(),
    estimatedElevationM: z.number().nullable(),
    estimatedDurationMinutes: z.number().int(),
    basedOnActivityId: z.string().nullable(),
    polyline: z.string().nullable(),
    reason: z.string()
  }),
  trainingPurpose: z.enum(["recovery", "endurance", "tempo", "climbing", "ftp", "long_ride", "rest", "mixed"]),
  intensity: z.enum(["easy", "moderate", "hard"]),
  workoutStructure: z.object({
    warmup: z.object({
      durationMinutes: z.number().int(),
      description: z.string()
    }),
    mainSet: z.array(TrainingBlockSchema),
    cooldown: z.object({
      durationMinutes: z.number().int(),
      description: z.string()
    })
  }),
  whyThisFitsToday: z.array(z.string()),
  avoidToday: z.array(z.string()),
  nutrition: z.array(z.string()),
  recovery: z.array(z.string()),
  safetyNotes: z.array(z.string()),
  confidence: z.object({
    level: z.enum(["high", "medium", "low"]),
    reason: z.string()
  }),
  missingData: z.array(z.string()),
  fallbackUsed: z.boolean().optional()
});

export const PlannerAgentResponseSchema = z.object({
  plan: RidePlanSchema,
  trainingMemory: TrainingMemorySchema,
  routeCandidates: z.array(RouteCandidateSchema),
  model: z.string().nullable(),
  fallbackUsed: z.boolean()
});

export type RidePlanInput = z.infer<typeof RidePlanInputSchema>;
export type TrainingBlock = z.infer<typeof TrainingBlockSchema>;
export type RidePlan = z.infer<typeof RidePlanSchema>;
export type PlannerAgentResponse = z.infer<typeof PlannerAgentResponseSchema>;

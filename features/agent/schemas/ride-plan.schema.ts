import { z } from "zod";
import { PlannerGoalSchema, ReadinessSchema, RouteCandidateSchema, RoutePreferenceSchema, RouteProviderSchema, RouteSourceSchema } from "@/features/agent/schemas/route-candidate.schema";
import { RouteTypeSchema, TrainingMemorySchema } from "@/features/agent/schemas/training-memory.schema";

export const RidePlanInputSchema = z.object({
  durationMinutes: z.number().int().min(20).max(360),
  goal: PlannerGoalSchema,
  readiness: ReadinessSchema,
  routePreference: RoutePreferenceSchema.default("not_sure"),
  startLocation: z.object({
    type: z.enum(["profile_default", "manual", "recent_activity_start", "unknown"]).default("unknown"),
    label: z.string().nullable().default(null),
    lat: z.number().nullable().default(null),
    lng: z.number().nullable().default(null)
  }).default({ type: "unknown", label: null, lat: null, lng: null }),
  weatherAware: z.boolean().default(false),
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
    source: RouteSourceSchema,
    provider: RouteProviderSchema,
    region: z.string().nullable(),
    routeType: RouteTypeSchema,
    estimatedDistanceKm: z.number().nullable(),
    estimatedElevationM: z.number().nullable(),
    estimatedDurationMinutes: z.number().int(),
    difficulty: z.enum(["easy", "moderate", "hard", "unknown"]),
    basedOnActivityId: z.string().nullable(),
    polyline: z.string().nullable(),
    mapPreviewAvailable: z.boolean(),
    routeUrl: z.string().nullable(),
    reason: z.string()
  }),
  trainingPurpose: z.enum(["recovery", "endurance", "tempo", "climbing", "sprint", "ftp", "long_ride", "rest", "mixed"]),
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
  alternatives: z.array(z.object({
    name: z.string(),
    reason: z.string(),
    difficulty: z.enum(["easy", "moderate", "hard", "unknown"])
  })).default([]),
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

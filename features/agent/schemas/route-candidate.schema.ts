import { z } from "zod";
import { RouteTypeSchema } from "@/features/agent/schemas/training-memory.schema";

export const PlannerGoalSchema = z.enum(["recovery", "endurance", "tempo", "climbing", "sprint", "ftp", "fat_loss", "long_ride", "route_exploration"]);
export const ReadinessSchema = z.enum(["fresh", "normal", "tired", "not_sure"]);
export const RoutePreferenceSchema = z.enum(["previous_route", "external_route", "catalog_route", "known_route", "flat", "climbing", "low_traffic", "riverside", "recovery", "not_sure"]);

export const RouteSourceSchema = z.enum(["previous_activity", "external_api", "route_catalog", "manual_fallback"]);
export const RouteProviderSchema = z.enum(["strava_activity", "openrouteservice", "ridewithgps", "catalog", "fallback"]);

export const RouteCandidateSchema = z.object({
  id: z.string(),
  name: z.string(),
  source: RouteSourceSchema,
  provider: RouteProviderSchema.default("fallback"),
  region: z.string().nullable(),
  routeType: RouteTypeSchema,
  distanceKm: z.number().nullable(),
  elevationM: z.number().nullable(),
  durationMinutes: z.number().nullable(),
  difficulty: z.enum(["easy", "moderate", "hard", "unknown"]),
  suitableGoals: z.array(PlannerGoalSchema),
  polyline: z.string().nullable(),
  mapPreviewAvailable: z.boolean().default(false),
  routeUrl: z.string().nullable().default(null),
  basedOnActivityId: z.string().nullable(),
  safetyNotes: z.array(z.string()),
  notes: z.string(),
  score: z.number(),
  scoreReasons: z.array(z.string())
});

export type PlannerGoal = z.infer<typeof PlannerGoalSchema>;
export type Readiness = z.infer<typeof ReadinessSchema>;
export type RoutePreference = z.infer<typeof RoutePreferenceSchema>;
export type RouteCandidate = z.infer<typeof RouteCandidateSchema>;
export type RouteSource = z.infer<typeof RouteSourceSchema>;
export type RouteProviderId = z.infer<typeof RouteProviderSchema>;

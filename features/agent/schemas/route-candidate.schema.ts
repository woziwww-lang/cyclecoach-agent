import { z } from "zod";
import { RouteTypeSchema } from "@/features/agent/schemas/training-memory.schema";

export const PlannerGoalSchema = z.enum(["recovery", "endurance", "climbing", "ftp", "fat_loss", "long_ride"]);
export const ReadinessSchema = z.enum(["fresh", "normal", "tired", "not_sure"]);
export const RoutePreferenceSchema = z.enum(["previous_route", "known_route", "flat", "climbing", "recovery", "not_sure"]);

export const RouteCandidateSchema = z.object({
  id: z.string(),
  name: z.string(),
  source: z.enum(["previous_activity", "route_catalog", "manual_fallback"]),
  region: z.string().nullable(),
  routeType: RouteTypeSchema,
  distanceKm: z.number().nullable(),
  elevationM: z.number().nullable(),
  durationMinutes: z.number().nullable(),
  difficulty: z.enum(["easy", "moderate", "hard", "unknown"]),
  suitableGoals: z.array(PlannerGoalSchema),
  polyline: z.string().nullable(),
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

import type { RidePlanInput } from "@/features/agent/schemas/ride-plan.schema";
import type { RouteCandidate } from "@/features/agent/schemas/route-candidate.schema";
import type { TrainingMemory } from "@/features/agent/schemas/training-memory.schema";

export function scoreRouteCandidate(candidate: RouteCandidate, input: RidePlanInput, memory: TrainingMemory): RouteCandidate {
  let score = 20;
  const reasons: string[] = [...candidate.scoreReasons];

  if (candidate.source === "previous_activity") {
    score += input.routePreference === "previous_route" ? 24 : 14;
    reasons.push("uses a familiar route from your Strava history");
  }
  if (candidate.source === "external_api") {
    score += input.routePreference === "external_route" || input.routePreference === "not_sure" ? 18 : 6;
    reasons.push("can generate a route from the selected start area");
  }
  if (candidate.source === "route_catalog") {
    score += input.routePreference === "catalog_route" || input.routePreference === "known_route" ? 18 : 10;
    reasons.push("comes from the local Tokyo/Kanto route catalog");
  }
  if (candidate.suitableGoals.includes(input.goal)) {
    score += 22;
    reasons.push(`fits ${input.goal.replace("_", " ")} training`);
  }
  if (routePreferenceFits(candidate, input.routePreference)) {
    score += 16;
    reasons.push(`matches ${input.routePreference.replace("_", " ")} route preference`);
  }

  const targetMinutes = input.durationMinutes;
  if (candidate.durationMinutes) {
    const delta = Math.abs(candidate.durationMinutes - targetMinutes);
    if (delta <= 20) {
      score += 14;
      reasons.push("duration is close to your time budget");
    } else if (delta > 60) {
      score -= 10;
      reasons.push("duration may not match your time budget");
    }
  }

  const fatigueRisk = memory.fatigueSignals.length > 0 || input.readiness === "tired";
  if (fatigueRisk && (candidate.routeType === "climbing" || candidate.difficulty === "hard")) {
    score -= 34;
    reasons.push("penalized because fatigue or recent load makes hard climbing less suitable");
  }
  if (memory.last7Days.elevationM >= 1200 && candidate.routeType === "climbing") {
    score -= 18;
    reasons.push("recent week is already climbing-heavy");
  }
  if (input.readiness === "fresh" && input.goal === "climbing" && candidate.routeType === "climbing") {
    score += 16;
    reasons.push("fresh readiness supports a climbing route");
  }
  if (input.goal === "recovery" && candidate.routeType !== "climbing" && candidate.difficulty === "easy") {
    score += 14;
    reasons.push("easy terrain supports recovery");
  }
  if (candidate.mapPreviewAvailable || candidate.polyline) {
    score += 5;
    reasons.push("route has map data for preview");
  }

  return {
    ...candidate,
    score,
    scoreReasons: [...new Set(reasons)].slice(0, 8)
  };
}

function routePreferenceFits(candidate: RouteCandidate, preference: RidePlanInput["routePreference"]) {
  if (preference === "not_sure") return false;
  if (preference === "previous_route") return candidate.source === "previous_activity";
  if (preference === "external_route") return candidate.source === "external_api";
  if (preference === "catalog_route" || preference === "known_route") return candidate.source === "route_catalog";
  if (preference === "recovery") return candidate.routeType === "recovery" || candidate.difficulty === "easy";
  if (preference === "low_traffic") return candidate.routeType === "flat" || candidate.routeType === "recovery" || candidate.provider === "catalog";
  if (preference === "riverside") return /tamagawa|arakawa/i.test(candidate.name);
  return candidate.routeType === preference;
}

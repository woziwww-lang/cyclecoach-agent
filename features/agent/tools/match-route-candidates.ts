import type { RidePlanInput } from "@/features/agent/schemas/ride-plan.schema";
import type { RouteCandidate } from "@/features/agent/schemas/route-candidate.schema";
import type { TrainingMemory } from "@/features/agent/schemas/training-memory.schema";

export function matchRouteCandidates(input: RidePlanInput, memory: TrainingMemory, routeHistory: RouteCandidate[], routeCatalog: RouteCandidate[]) {
  const scored = [...routeHistory, ...routeCatalog].map((candidate) => scoreCandidate(candidate, input, memory));
  if (scored.length === 0) return [manualFallbackCandidate(input, memory)];
  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
}

function scoreCandidate(candidate: RouteCandidate, input: RidePlanInput, memory: TrainingMemory): RouteCandidate {
  let score = 20;
  const reasons: string[] = [];

  if (candidate.source === "previous_activity") {
    score += input.routePreference === "known_route" ? 8 : 14;
    reasons.push("uses a familiar route from your Strava history");
  }
  if (candidate.source === "route_catalog" && input.routePreference === "known_route") {
    score += 10;
    reasons.push("matches the known route preference");
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
  } else if (candidate.distanceKm) {
    const estimatedMinutes = estimateMinutes(candidate);
    const delta = Math.abs(estimatedMinutes - targetMinutes);
    if (delta <= 30) {
      score += 8;
      reasons.push("catalog distance roughly fits your time budget");
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
  if (candidate.polyline) {
    score += 5;
    reasons.push("route has map data for preview");
  }

  return {
    ...candidate,
    score,
    scoreReasons: reasons.length ? reasons : ["reasonable fallback match"]
  };
}

function routePreferenceFits(candidate: RouteCandidate, preference: RidePlanInput["routePreference"]) {
  if (preference === "not_sure") return false;
  if (preference === "previous_route") return candidate.source === "previous_activity";
  if (preference === "known_route") return candidate.source === "route_catalog";
  if (preference === "recovery") return candidate.routeType === "recovery" || candidate.difficulty === "easy";
  return candidate.routeType === preference;
}

function estimateMinutes(candidate: RouteCandidate) {
  const distance = candidate.distanceKm ?? 0;
  const elevationPenalty = (candidate.elevationM ?? 0) / 100;
  return Math.round(distance * 3 + elevationPenalty * 4);
}

function manualFallbackCandidate(input: RidePlanInput, memory: TrainingMemory): RouteCandidate {
  const tired = input.readiness === "tired" || memory.fatigueSignals.length > 0;
  return {
    id: "manual-fallback",
    name: tired ? "Short familiar recovery loop" : "Familiar low-risk local route",
    source: "manual_fallback",
    region: null,
    routeType: tired ? "recovery" : input.goal === "climbing" ? "rolling" : "endurance",
    distanceKm: null,
    elevationM: null,
    durationMinutes: tired ? Math.min(input.durationMinutes, 60) : input.durationMinutes,
    difficulty: tired ? "easy" : "unknown",
    suitableGoals: [input.goal],
    polyline: null,
    basedOnActivityId: null,
    safetyNotes: ["Use a route you already know and can shorten if conditions or legs feel worse."],
    notes: "No usable route history or catalog match was available, so this is a conservative manual route type.",
    score: 1,
    scoreReasons: ["manual fallback due to missing route data"]
  };
}

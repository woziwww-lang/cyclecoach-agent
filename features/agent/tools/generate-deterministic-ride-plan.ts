import type { RidePlan, RidePlanInput } from "@/features/agent/schemas/ride-plan.schema";
import type { RouteCandidate } from "@/features/agent/schemas/route-candidate.schema";
import type { TrainingMemory } from "@/features/agent/schemas/training-memory.schema";

export function generateDeterministicRidePlan(input: RidePlanInput, memory: TrainingMemory, candidates: RouteCandidate[]): RidePlan {
  const route = candidates[0];
  const fatigueRisk = input.readiness === "tired" || memory.fatigueSignals.length > 0;
  const climbingOverload = memory.last7Days.elevationM >= 1200 && input.goal === "climbing";
  const shouldRecover = fatigueRisk || climbingOverload;
  const duration = shouldRecover ? Math.min(input.durationMinutes, 60) : input.durationMinutes;
  const warmup = Math.min(15, Math.max(8, Math.round(duration * 0.18)));
  const cooldown = Math.min(12, Math.max(6, Math.round(duration * 0.12)));
  const mainDuration = Math.max(10, duration - warmup - cooldown);
  const purpose = shouldRecover ? (duration <= 30 ? "rest" : "recovery") : mapGoalToPurpose(input.goal);
  const intensity = purpose === "rest" || purpose === "recovery" ? "easy" : input.goal === "ftp" ? "hard" : "moderate";

  return {
    title: buildTitle(route, purpose),
    summary: buildSummary(route, input, memory, shouldRecover),
    recommendedRoute: {
      name: route.name,
      source: route.source,
      region: route.region,
      routeType: route.routeType,
      estimatedDistanceKm: route.distanceKm,
      estimatedElevationM: route.elevationM,
      estimatedDurationMinutes: route.durationMinutes ?? duration,
      basedOnActivityId: route.basedOnActivityId,
      polyline: route.polyline,
      reason: route.scoreReasons.slice(0, 3).join("; ") || route.notes
    },
    trainingPurpose: purpose,
    intensity,
    workoutStructure: {
      warmup: {
        durationMinutes: warmup,
        description: "Start easy and use the first minutes to check legs, breathing, and traffic conditions."
      },
      mainSet: buildMainSet(input, mainDuration, route, shouldRecover),
      cooldown: {
        durationMinutes: cooldown,
        description: "Finish easy. Do not add sprints or extra climbing at the end."
      }
    },
    whyThisFitsToday: buildWhy(input, memory, route, shouldRecover),
    avoidToday: buildAvoid(input, memory, route, shouldRecover),
    nutrition: buildNutrition(duration, purpose),
    recovery: buildRecovery(shouldRecover, purpose),
    safetyNotes: [...route.safetyNotes, "Check weather, daylight, and road conditions before leaving.", "This is training guidance, not medical advice."],
    confidence: {
      level: confidenceLevel(memory, route),
      reason: confidenceReason(memory, route)
    },
    missingData: memory.missingData
  };
}

function mapGoalToPurpose(goal: RidePlanInput["goal"]): RidePlan["trainingPurpose"] {
  if (goal === "ftp") return "tempo";
  if (goal === "fat_loss") return "endurance";
  return goal;
}

function buildTitle(route: RouteCandidate, purpose: RidePlan["trainingPurpose"]) {
  if (purpose === "recovery" || purpose === "rest") return `Keep it easy on ${route.name}`;
  if (purpose === "climbing") return `Climbing-focused ride: ${route.name}`;
  return `${route.name} for ${purpose.replace("_", " ")}`;
}

function buildSummary(route: RouteCandidate, input: RidePlanInput, memory: TrainingMemory, shouldRecover: boolean) {
  if (shouldRecover) {
    return `Your recent signals suggest keeping the next ride easy. Use ${route.name} only if it can stay low-stress and easy to shorten.`;
  }
  const dataNote = memory.latestRide ? `Recent context includes ${memory.latestRide.name}.` : "No recent Strava context is available.";
  return `This plan matches your ${input.goal.replace("_", " ")} goal with a concrete route candidate: ${route.name}. ${dataNote}`;
}

function buildMainSet(input: RidePlanInput, minutes: number, route: RouteCandidate, shouldRecover: boolean) {
  if (shouldRecover) {
    return [
      {
        title: "Easy route repeat",
        durationMinutes: minutes,
        intensity: "Conversational easy",
        description: `Ride ${route.name} gently. If the legs feel worse after 15 minutes, turn around or stop.`
      }
    ];
  }
  if (input.goal === "ftp") {
    const block = Math.max(12, Math.floor((minutes - 8) / 2));
    return [
      { title: "Controlled tempo block 1", durationMinutes: block, intensity: "Moderate-hard", description: `Use steady sections of ${route.name}; avoid traffic-heavy segments.` },
      { title: "Easy reset", durationMinutes: 8, intensity: "Easy", description: "Spin easy and let breathing settle." },
      { title: "Controlled tempo block 2", durationMinutes: block, intensity: "Moderate-hard", description: "Match the first effort without forcing the finish." }
    ];
  }
  if (input.goal === "climbing") {
    return [
      {
        title: "Controlled climbing block",
        durationMinutes: minutes,
        intensity: "Moderate",
        description: `Use ${route.name} for steady climbing practice. Stay seated where possible and leave margin for the descent.`
      }
    ];
  }
  return [
    {
      title: "Main endurance block",
      durationMinutes: minutes,
      intensity: input.goal === "recovery" ? "Easy" : "Easy to moderate",
      description: `Ride ${route.name} smoothly. Keep the effort sustainable and avoid chasing segments.`
    }
  ];
}

function buildWhy(input: RidePlanInput, memory: TrainingMemory, route: RouteCandidate, shouldRecover: boolean) {
  const reasons = [...route.scoreReasons.slice(0, 3)];
  if (memory.latestRide) reasons.push(`Latest ride context: ${memory.latestRide.name}, ${memory.latestRide.distanceKm} km and ${memory.latestRide.elevationM} m.`);
  if (memory.last7Days.rideCount > 0) reasons.push(`Last 7 days: ${memory.last7Days.distanceKm} km, ${memory.last7Days.elevationM} m, ${Math.round(memory.last7Days.movingTimeMinutes / 60)} h.`);
  if (shouldRecover) reasons.push("Recovery is prioritized because readiness or recent load suggests caution.");
  if (input.routePreference !== "not_sure") reasons.push(`Route preference considered: ${input.routePreference.replace("_", " ")}.`);
  return reasons.length ? reasons : ["This is a conservative plan based on limited current data."];
}

function buildAvoid(input: RidePlanInput, memory: TrainingMemory, route: RouteCandidate, shouldRecover: boolean) {
  const avoid: string[] = [];
  if (shouldRecover) avoid.push("Avoid hard intervals, sprinting, or extending the route just because you feel better early.");
  if (memory.last7Days.elevationM >= 1200) avoid.push("Avoid stacking another major climbing day after a climbing-heavy week.");
  if (route.routeType === "climbing" && input.readiness !== "fresh") avoid.push("Avoid technical descents or steep climbs if legs are not fresh.");
  if (input.goal === "ftp") avoid.push("Avoid doing tempo work in traffic or stop-and-go sections.");
  return avoid.length ? avoid : ["Avoid turning the ride into an unplanned race effort."];
}

function buildNutrition(duration: number, purpose: RidePlan["trainingPurpose"]) {
  if (purpose === "rest") return ["No ride fueling needed; eat normally and prioritize hydration."];
  if (duration >= 90) return ["Bring carbohydrates and start fueling early.", "Drink regularly; add electrolytes if conditions are hot."];
  return ["Bring water.", "For short easy rides, normal meals are usually enough unless you start hungry."];
}

function buildRecovery(shouldRecover: boolean, purpose: RidePlan["trainingPurpose"]) {
  if (shouldRecover || purpose === "recovery" || purpose === "rest") return ["Prioritize sleep tonight.", "Keep the next hard ride at least 24 hours away if fatigue persists."];
  return ["Refuel after the ride with a normal meal.", "Use tomorrow's leg feel to decide whether to go easy or continue training."];
}

function confidenceLevel(memory: TrainingMemory, route: RouteCandidate): RidePlan["confidence"]["level"] {
  if (route.source === "previous_activity" && memory.latestRide && memory.missingData.length <= 1) return "high";
  if (route.source !== "manual_fallback" && memory.last30Days.rideCount > 0) return "medium";
  return "low";
}

function confidenceReason(memory: TrainingMemory, route: RouteCandidate) {
  if (route.source === "previous_activity") return "Uses your recent training memory and a mapped route from your own Strava history.";
  if (route.source === "route_catalog") return "Uses your recent training memory plus a built-in route catalog candidate.";
  if (memory.last30Days.rideCount === 0) return "No recent Strava activity was available, so this is a lower-confidence manual recommendation.";
  return "Limited route data was available, so route specificity is lower.";
}

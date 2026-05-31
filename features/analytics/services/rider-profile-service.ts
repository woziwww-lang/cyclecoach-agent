import type { StravaActivity } from "@prisma/client";
import type { AnalyticsDashboard, RiderProfile } from "@/features/analytics/schemas/rider-profile.schema";
import { buildElevationTrend, buildWeeklyTrainingLoad } from "@/features/analytics/services/training-load-service";

export function buildRiderProfile(activities: StravaActivity[]): RiderProfile {
  const rides = activities.filter((activity) => (activity.distanceMeters ?? 0) > 0);
  if (rides.length < 3) {
    return {
      riderType: "unknown",
      confidence: "low",
      scores: { endurance: 20, climbing: 20, speed: 20, consistency: 20, intensity: 20 },
      evidence: ["Fewer than 3 usable outdoor rides are available."],
      strengths: ["You have enough data to start, but not enough to classify reliably."],
      limiters: ["More outdoor rides with distance/elevation will improve the profile."],
      bestRoutes: ["Familiar low-risk endurance routes"],
      trainingFocus: ["Build a consistent base with easy endurance rides."],
      nextExperiment: "Sync more outdoor rides, then repeat this analyzer after 2-3 weeks.",
      missingData: ["Insufficient ride history", "Power data may be missing", "Heart-rate data may be missing"]
    };
  }

  const totalDistanceKm = sum(rides, (ride) => (ride.distanceMeters ?? 0) / 1000);
  const totalElevationM = sum(rides, (ride) => ride.totalElevationGain ?? 0);
  const totalMovingHours = sum(rides, (ride) => (ride.movingTimeSec ?? 0) / 3600);
  const avgDistanceKm = totalDistanceKm / rides.length;
  const elevationPerKm = totalDistanceKm > 0 ? totalElevationM / totalDistanceKm : 0;
  const longRideCount = rides.filter((ride) => ((ride.distanceMeters ?? 0) / 1000) >= 60 || ((ride.movingTimeSec ?? 0) / 3600) >= 3).length;
  const climbingRideCount = rides.filter((ride) => {
    const km = (ride.distanceMeters ?? 0) / 1000;
    return km > 0 && (ride.totalElevationGain ?? 0) / km >= 12;
  }).length;
  const avgSpeedKmh = totalMovingHours > 0 ? totalDistanceKm / totalMovingHours : 0;
  const powerRideCount = rides.filter((ride) => ride.averageWatts || ride.weightedAverageWatts).length;
  const hrRideCount = rides.filter((ride) => ride.averageHeartrate).length;

  const scores = {
    endurance: clamp((avgDistanceKm / 80) * 55 + (longRideCount / rides.length) * 45),
    climbing: clamp((elevationPerKm / 18) * 70 + (climbingRideCount / rides.length) * 30),
    speed: clamp((avgSpeedKmh / 32) * 100),
    consistency: clamp(Math.min(rides.length / 12, 1) * 80 + Math.min(totalMovingHours / 25, 1) * 20),
    intensity: clamp((powerRideCount / rides.length) * 55 + (hrRideCount / rides.length) * 30 + (avgSpeedKmh > 27 ? 15 : 0))
  };

  const riderType = classifyRider(scores);
  const missingData: string[] = [];
  if (powerRideCount < Math.max(3, rides.length * 0.4)) missingData.push("Limited power data, so speed/intensity scores are lower confidence.");
  if (hrRideCount < Math.max(3, rides.length * 0.4)) missingData.push("Limited heart-rate data, so fatigue and intensity interpretation is approximate.");

  return {
    riderType,
    confidence: rides.length >= 12 && missingData.length <= 1 ? "high" : rides.length >= 6 ? "medium" : "low",
    scores,
    evidence: [
      `${rides.length} recent usable rides analyzed.`,
      `${round(totalDistanceKm)} km and ${Math.round(totalElevationM)} m elevation in the sample.`,
      `${round(elevationPerKm)} m/km climbing density and ${round(avgSpeedKmh)} km/h average moving speed.`
    ],
    strengths: buildStrengths(scores),
    limiters: buildLimiters(scores, missingData),
    bestRoutes: buildBestRoutes(riderType),
    trainingFocus: buildTrainingFocus(riderType, scores),
    nextExperiment: buildNextExperiment(riderType),
    missingData
  };
}

export function buildAnalyticsDashboard(activities: StravaActivity[]): AnalyticsDashboard {
  return {
    riderProfile: buildRiderProfile(activities),
    weeklyLoad: buildWeeklyTrainingLoad(activities),
    elevationTrend: buildElevationTrend(activities),
    powerAvailable: activities.some((activity) => activity.averageWatts || activity.weightedAverageWatts)
  };
}

function classifyRider(scores: RiderProfile["scores"]): RiderProfile["riderType"] {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = sorted[0]?.[0];
  if (top === "climbing") return "climber";
  if (top === "speed" || top === "intensity") return scores.endurance > 55 ? "rouleur" : "punchy";
  if (top === "endurance") return "endurance";
  if (top === "consistency") return "base_builder";
  return "unknown";
}

function buildStrengths(scores: RiderProfile["scores"]) {
  return Object.entries(scores)
    .filter(([, value]) => value >= 60)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => `${label(key)} is currently a relative strength.`);
}

function buildLimiters(scores: RiderProfile["scores"], missingData: string[]) {
  const lowScores = Object.entries(scores)
    .filter(([, value]) => value < 45)
    .slice(0, 2)
    .map(([key]) => `${label(key)} has room to develop.`);
  return [...lowScores, ...missingData.slice(0, 1)];
}

function buildBestRoutes(type: RiderProfile["riderType"]) {
  if (type === "climber") return ["Tomin no Mori", "Yabitsu Pass", "Tama Hills Rolling Route"];
  if (type === "endurance" || type === "base_builder") return ["Tamagawa Endurance Course", "Arakawa Flat Endurance Course"];
  if (type === "rouleur" || type === "punchy") return ["Oi Futo Loop", "Onekan / Tama New Town Rolling Course"];
  return ["Tamagawa Endurance Course", "Familiar low-risk local route"];
}

function buildTrainingFocus(type: RiderProfile["riderType"], scores: RiderProfile["scores"]) {
  if (type === "climber") return ["Keep one focused climbing day per week.", "Add easy endurance volume so climbs are supported by aerobic base."];
  if (type === "endurance") return ["Preserve long Z2 consistency.", "Add controlled tempo blocks if recovery is good."];
  if (type === "rouleur" || type === "punchy") return ["Use repeatable loops for controlled tempo or short efforts.", "Avoid turning every ride into intensity."];
  if (scores.consistency < 45) return ["Make weekly frequency predictable before adding harder training."];
  return ["Build aerobic consistency and collect more data."];
}

function buildNextExperiment(type: RiderProfile["riderType"]) {
  if (type === "climber") return "Try a moderate rolling route and keep the climbs steady, not maximal.";
  if (type === "endurance") return "Try one 90-minute endurance ride with very even pacing.";
  if (type === "rouleur" || type === "punchy") return "Try a flat loop with 2 controlled tempo blocks and compare pacing stability.";
  return "Ride three outdoor sessions with route data, then rerun the profile.";
}

function label(key: string) {
  return key.replace("_", " ");
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function sum<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((total, item) => total + selector(item), 0);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

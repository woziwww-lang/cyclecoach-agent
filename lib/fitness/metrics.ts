export type EffortClassification =
  | "recovery"
  | "endurance"
  | "tempo"
  | "threshold"
  | "vo2max"
  | "climbing"
  | "mixed"
  | "unknown";

export type RideMetricsInput = {
  distanceMeters?: number | null;
  movingTimeSec?: number | null;
  elevationGainMeters?: number | null;
  avgHr?: number | null;
  maxHr?: number | null;
  avgWatts?: number | null;
  weightedWatts?: number | null;
  ftp?: number | null;
  userMaxHr?: number | null;
};

export function calculateRideMetrics(input: RideMetricsInput) {
  const distanceKm = (input.distanceMeters ?? 0) / 1000;
  const movingHours = (input.movingTimeSec ?? 0) / 3600;
  const avgSpeedKph = movingHours > 0 ? distanceKm / movingHours : null;
  const elevationGainMeters = input.elevationGainMeters ?? 0;
  const climbingRatio = distanceKm > 0 ? elevationGainMeters / distanceKm : null;

  let intensity: number | null = null;
  let intensitySource: "power" | "heart_rate" | "summary_only" = "summary_only";
  let confidence = 0.35;

  if (input.weightedWatts && input.ftp) {
    intensity = input.weightedWatts / input.ftp;
    intensitySource = "power";
    confidence = 0.9;
  } else if (input.avgHr && input.userMaxHr) {
    intensity = input.avgHr / input.userMaxHr;
    intensitySource = "heart_rate";
    confidence = 0.72;
  } else if (input.avgHr && input.maxHr) {
    intensity = input.avgHr / input.maxHr;
    intensitySource = "heart_rate";
    confidence = 0.6;
  }

  const classification = classifyEffort(intensity, climbingRatio);
  const missingDataWarnings = buildMissingDataWarnings(input);

  return {
    distanceKm,
    movingHours,
    avgSpeedKph,
    elevationGainMeters,
    climbingRatio,
    intensity,
    intensitySource,
    classification,
    confidence,
    missingDataWarnings
  };
}

export function classifyEffort(intensity: number | null, climbingRatio: number | null): EffortClassification {
  const climbingHeavy = climbingRatio != null && climbingRatio > 15;

  if (intensity == null) return climbingHeavy ? "climbing" : "unknown";
  if (climbingHeavy && intensity >= 0.72) return "climbing";
  if (intensity < 0.6) return "recovery";
  if (intensity < 0.75) return "endurance";
  if (intensity < 0.85) return "tempo";
  if (intensity < 0.95) return "threshold";
  return "vo2max";
}

function buildMissingDataWarnings(input: RideMetricsInput) {
  const warnings: string[] = [];
  if (!input.avgHr) warnings.push("No heart-rate data was available.");
  if (!input.avgWatts && !input.weightedWatts) warnings.push("No power data was available.");
  if (!input.ftp) warnings.push("No FTP was configured, so power-based intensity could not be normalized.");
  return warnings;
}

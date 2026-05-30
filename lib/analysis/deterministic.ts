import type { StravaActivity, StravaActivityStream } from "@prisma/client";
import type { AnalysisResult } from "@/lib/analysis/analysis-schema";
import { calculateRideMetrics } from "@/lib/fitness/metrics";
import { formatDistanceKm, formatDuration, formatSpeedKph } from "@/lib/format";

export function analyzeActivityDeterministic(activity: StravaActivity, stream?: StravaActivityStream | null): AnalysisResult {
  const metrics = calculateRideMetrics({
    distanceMeters: activity.distanceMeters,
    movingTimeSec: activity.movingTimeSec,
    elevationGainMeters: activity.totalElevationGain,
    avgHr: activity.averageHeartrate,
    maxHr: activity.maxHeartrate,
    avgWatts: activity.averageWatts,
    weightedWatts: activity.weightedAverageWatts
  });

  const missingData = [
    ...metrics.missingDataWarnings,
    !activity.summaryPolyline && !hasLatLngStream(stream) ? "No route polyline or lat/lng stream was available." : null,
    !stream ? "Detailed streams are not cached yet or were unavailable from Strava." : null
  ].filter(Boolean) as string[];

  const confidence = metrics.confidence >= 0.75 ? "high" : metrics.confidence >= 0.5 ? "medium" : "low";
  const isLong = metrics.distanceKm >= 60 || metrics.movingHours >= 3;
  const isHilly = (metrics.climbingRatio ?? 0) >= 12;

  return {
    overallVerdict: buildVerdict(metrics.classification, isLong, isHilly),
    effortType: metrics.classification,
    keyMetrics: [
      { label: "Distance", value: formatDistanceKm(activity.distanceMeters) },
      { label: "Moving time", value: formatDuration(activity.movingTimeSec) },
      { label: "Elevation", value: `${Math.round(activity.totalElevationGain ?? 0)} m`, note: metrics.climbingRatio ? `${metrics.climbingRatio.toFixed(1)} m/km` : undefined },
      { label: "Avg speed", value: formatSpeedKph(activity.averageSpeed) },
      { label: "Avg HR", value: activity.averageHeartrate ? `${Math.round(activity.averageHeartrate)} bpm` : "Missing" },
      { label: "Avg power", value: activity.averageWatts ? `${Math.round(activity.averageWatts)} W` : "Missing" }
    ],
    trainingMeaning: buildTrainingMeaning(metrics.classification, metrics.intensitySource, isLong, isHilly),
    wentWell: [
      `${formatDistanceKm(activity.distanceMeters)} completed with ${formatDuration(activity.movingTimeSec)} of moving time.`,
      isHilly ? "This ride included meaningful climbing load." : "The route profile looks manageable for aerobic work.",
      activity.summaryPolyline || hasLatLngStream(stream) ? "Route data is available, so map review is reliable." : "Summary metrics were saved successfully."
    ],
    toImprove: buildImprovementBullets(activity, missingData),
    nextRide: {
      title: metrics.classification === "recovery" ? "Build with easy endurance" : "Recover, then ride aerobic",
      details:
        metrics.classification === "recovery"
          ? "If you feel fresh, do a steady Z2-style endurance ride next and keep the effort conversational."
          : "Take an easy spin or rest day if your legs feel heavy. Your next quality ride should be controlled, not maximal.",
      duration: metrics.classification === "recovery" ? "60-90 min" : "30-75 min",
      intensity: "Easy to moderate"
    },
    recovery: [
      "Refuel with carbohydrates and protein after longer or hillier rides.",
      "Hydrate based on sweat rate and weather; do not wait until you feel depleted.",
      "If you feel unusual pain, dizziness, chest symptoms, or persistent fatigue, stop training and consult a qualified professional."
    ],
    confidence: {
      level: confidence,
      reason:
        confidence === "low"
          ? "Heart-rate, power, FTP, or detailed stream data is missing, so the analysis stays conservative."
          : "The analysis has enough summary signals to classify the ride, but it still avoids inventing zones or FTP."
    },
    missingData,
    disclaimer: "This is training guidance, not medical advice.",
    fallbackUsed: true
  };
}

function hasLatLngStream(stream?: StravaActivityStream | null) {
  return Boolean(stream?.latlngCount && stream.latlngCount > 1);
}

function buildVerdict(classification: string, isLong: boolean, isHilly: boolean) {
  if (isLong && isHilly) return "A substantial endurance ride with meaningful climbing stress.";
  if (isLong) return "A solid endurance ride that likely carried aerobic training value.";
  if (isHilly) return "A climbing-biased ride with useful strength-endurance stimulus.";
  if (classification === "unknown") return "A ride with useful summary data, but limited intensity confidence.";
  return `A ${classification} ride based on the available Strava summary data.`;
}

function buildTrainingMeaning(classification: string, source: string, isLong: boolean, isHilly: boolean) {
  const base =
    classification === "unknown"
      ? "Without reliable heart-rate or power context, this is best treated as a conservative summary-based assessment."
      : `The ride most closely matches ${classification} work using ${source.replace("_", " ")} signals.`;
  const extras = [isLong ? "It also contributes to long-duration aerobic durability." : null, isHilly ? "The climbing load adds muscular endurance demand." : null].filter(Boolean);
  return [base, ...extras].join(" ");
}

function buildImprovementBullets(activity: StravaActivity, missingData: string[]) {
  const bullets = [
    activity.averageHeartrate ? "Compare heart-rate drift across similar rides over time." : "Use heart-rate data if available to improve intensity confidence.",
    activity.averageWatts ? "Compare power against your known FTP before calling this threshold or VO2 work." : "Power data would make intensity and pacing analysis much more precise.",
    "Add RPE notes after rides so the coach can compare subjective effort with Strava metrics."
  ];
  if (missingData.length > 0) bullets.push("Treat conclusions as conservative because some data is missing.");
  return bullets;
}

import { OllamaProvider } from "@/lib/ai/ollama";
import { buildActivityAnalysisPrompt, buildCoachSystemPrompt } from "@/lib/ai/prompts";
import { prisma } from "@/lib/db/prisma";
import { calculateRideMetrics } from "@/lib/fitness/metrics";
import { fetchAndCacheActivityDetailAndStreams } from "@/lib/strava/sync";

export async function analyzeActivity(userId: string, activityId: string) {
  await fetchAndCacheActivityDetailAndStreams(userId, activityId);

  const activity = await prisma.stravaActivity.findFirst({
    where: { id: activityId, userId },
    include: { stream: true }
  });

  if (!activity) throw new Error("ACTIVITY_NOT_FOUND");

  const computedMetrics = calculateRideMetrics({
    distanceMeters: activity.distanceMeters,
    movingTimeSec: activity.movingTimeSec,
    elevationGainMeters: activity.totalElevationGain,
    avgHr: activity.averageHeartrate,
    maxHr: activity.maxHeartrate,
    avgWatts: activity.averageWatts,
    weightedWatts: activity.weightedAverageWatts
  });

  const summaryForPrompt = {
    name: activity.name,
    sportType: activity.sportType,
    startDate: activity.startDate,
    distanceMeters: activity.distanceMeters,
    movingTimeSec: activity.movingTimeSec,
    elapsedTimeSec: activity.elapsedTimeSec,
    totalElevationGain: activity.totalElevationGain,
    averageSpeed: activity.averageSpeed,
    maxSpeed: activity.maxSpeed,
    averageHeartrate: activity.averageHeartrate,
    maxHeartrate: activity.maxHeartrate,
    averageWatts: activity.averageWatts,
    weightedAverageWatts: activity.weightedAverageWatts,
    averageCadence: activity.averageCadence,
    calories: activity.calories,
    hasRoute: Boolean(activity.summaryPolyline)
  };

  const streamAvailability = parseJsonString<string[]>(activity.stream?.availableKeys, []);

  const provider = new OllamaProvider();
  let analysisText: string;

  try {
    analysisText = await provider.generateText({
      system: buildCoachSystemPrompt(),
      prompt: buildActivityAnalysisPrompt({
        activity: summaryForPrompt,
        computedMetrics,
        streamAvailability
      })
    });
  } catch (error) {
    analysisText = buildRuleBasedFallback(summaryForPrompt, computedMetrics, String(error));
  }

  return prisma.activityAnalysis.create({
    data: {
      userId,
      activityId,
      provider: "ollama",
      model: process.env.OLLAMA_MODEL ?? "qwen2.5:7b",
      inputSummary: JSON.stringify({
        activity: summaryForPrompt,
        computedMetrics,
        streamAvailability
      }),
      analysisJson: JSON.stringify({
        text: analysisText,
        computedMetrics,
        generatedAt: new Date().toISOString()
      }),
      analysisText,
      confidence: computedMetrics.confidence
    }
  });
}

function parseJsonString<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function buildRuleBasedFallback(activity: Record<string, unknown>, metrics: ReturnType<typeof calculateRideMetrics>, reason: string) {
  return `Activity Summary
${String(activity.name)} was classified as ${metrics.classification} based on the available summary data.

Intensity Analysis
The analysis confidence is ${Math.round(metrics.confidence * 100)}%. The intensity source is ${metrics.intensitySource}. Missing data limits precision.

Climbing Analysis
Elevation gain was ${Math.round(metrics.elevationGainMeters)} m, with about ${metrics.climbingRatio?.toFixed(1) ?? "unknown"} m/km.

Next Workout Recommendation
If you feel recovered, do an easy endurance ride next. If your legs feel heavy, choose rest or a short recovery spin.

Missing Data Warnings
${metrics.missingDataWarnings.join("\n")}

LLM fallback note
Ollama was unavailable or failed: ${reason}

This is not medical advice.`;
}

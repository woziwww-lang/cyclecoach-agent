import { OllamaProvider } from "@/lib/ai/ollama";
import { buildActivityAnalysisPrompt, buildCoachSystemPrompt } from "@/lib/ai/prompts";
import { parseAnalysisResponse } from "@/lib/ai/parse-analysis";
import { analyzeActivityDeterministic } from "@/lib/analysis/deterministic";
import { prisma } from "@/lib/db/prisma";
import { fetchAndCacheActivityDetailAndStreams } from "@/lib/strava/sync";
import { getEffectiveOllamaConfig } from "@/lib/settings/user-settings";

export async function analyzeActivity(userId: string, activityId: string) {
  await fetchAndCacheActivityDetailAndStreams(userId, activityId);

  const activity = await prisma.stravaActivity.findFirst({
    where: { id: activityId, userId },
    include: { stream: true }
  });

  if (!activity) throw new Error("ACTIVITY_NOT_FOUND");

  const deterministic = analyzeActivityDeterministic(activity, activity.stream);

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
    hasRoute: Boolean(activity.summaryPolyline || activity.stream?.latlngCount)
  };

  const streamAvailability = parseJsonString<string[]>(activity.stream?.availableKeys, []);

  const config = await getEffectiveOllamaConfig(userId);
  const provider = new OllamaProvider(config.baseUrl, config.model);
  let analysisResult = deterministic;
  let analysisText = JSON.stringify(deterministic, null, 2);
  let fallbackUsed = true;

  try {
    const rawText = await provider.generateText({
      system: buildCoachSystemPrompt(),
      prompt: buildActivityAnalysisPrompt({
        activity: summaryForPrompt,
        computedMetrics: deterministic,
        streamAvailability
      })
    });
    analysisResult = parseAnalysisResponse(rawText, deterministic);
    fallbackUsed = Boolean(analysisResult.fallbackUsed);
    analysisText = formatAnalysisText(analysisResult);
  } catch (error) {
    analysisResult = {
      ...deterministic,
      fallbackUsed: true,
      missingData: [...deterministic.missingData, `LLM unavailable or failed: ${String(error)}`]
    };
    analysisText = formatAnalysisText(analysisResult);
  }

  return prisma.activityAnalysis.create({
    data: {
      userId,
      activityId,
      provider: "ollama",
      model: config.model,
      inputSummary: JSON.stringify({
        activity: summaryForPrompt,
        deterministic,
        streamAvailability
      }),
      deterministicResult: JSON.stringify(deterministic),
      aiResult: JSON.stringify(analysisResult),
      analysisJson: JSON.stringify(analysisResult),
      analysisText,
      confidence: confidenceToNumber(analysisResult.confidence.level),
      fallbackUsed
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

function confidenceToNumber(level: string) {
  if (level === "high") return 0.85;
  if (level === "medium") return 0.6;
  return 0.35;
}

function formatAnalysisText(result: { overallVerdict: string; effortType: string; trainingMeaning: string; nextRide: { title: string; details: string }; confidence: { level: string; reason: string }; missingData: string[] }) {
  return `Overall Verdict
${result.overallVerdict}

Effort Type
${result.effortType}

Training Meaning
${result.trainingMeaning}

Next Ride
${result.nextRide.title}: ${result.nextRide.details}

Confidence
${result.confidence.level}: ${result.confidence.reason}

Missing Data
${result.missingData.length ? result.missingData.join("\n") : "None flagged."}

This is training guidance, not medical advice.`;
}

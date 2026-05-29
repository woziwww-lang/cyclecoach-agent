"use client";

import type { ActivityAnalysis } from "@prisma/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { AnalysisResultCard } from "@/components/ai/analysis-result-card";
import { AnalysisSkeleton } from "@/components/ai/analysis-skeleton";
import { useAnalyzeActivityMutation } from "@/lib/api/activities";

export function AnalysisPanel({
  activityId,
  latestAnalysis
}: {
  activityId: string;
  latestAnalysis: ActivityAnalysis | null;
}) {
  const [analysisText, setAnalysisText] = useState(latestAnalysis?.analysisText ?? "");
  const [analysis, setAnalysis] = useState<ActivityAnalysis | null>(latestAnalysis);
  const [error, setError] = useState("");
  const analyzeMutation = useAnalyzeActivityMutation(activityId);

  async function analyze() {
    setError("");
    try {
      const response = await analyzeMutation.mutateAsync();
      setAnalysisText(response.analysis.analysisText ?? "");
      setAnalysis(response.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const loading = analyzeMutation.isPending;

  return (
    <aside className="space-y-4">
      <div className="cc-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Coach analysis</h2>
          <p className="text-sm text-muted">Deterministic metrics first, local Ollama explanation second.</p>
        </div>
        <Button
          onClick={analyze}
          disabled={loading}
        >
          {loading ? "Analyzing…" : "Ask AI"}
        </Button>
      </div>

      {error ? <div className="mt-4"><ErrorState title="Analysis failed" description={error} actionLabel="Try again" onRetry={analyze} /></div> : null}
      </div>

      {loading ? <AnalysisSkeleton /> : <AnalysisResultCard analysis={analysis} />}
      {analysisText && !analysis ? <div className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6">{analysisText}</div> : null}
    </aside>
  );
}

"use client";

import type { ActivityAnalysis } from "@prisma/client";
import { useState } from "react";
import { AnalysisResultCard } from "@/components/ai/analysis-result-card";
import { AnalysisSkeleton } from "@/components/ai/analysis-skeleton";

export function AnalysisPanel({
  activityId,
  latestAnalysis
}: {
  activityId: string;
  latestAnalysis: ActivityAnalysis | null;
}) {
  const [analysisText, setAnalysisText] = useState(latestAnalysis?.analysisText ?? "");
  const [analysis, setAnalysis] = useState<ActivityAnalysis | null>(latestAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/activities/${activityId}/analyze`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Analysis failed");
      setAnalysisText(json.analysis.analysisText);
      setAnalysis(json.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="space-y-4">
      <div className="rounded-3xl border bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Coach analysis</h2>
          <p className="text-sm text-muted">Deterministic metrics first, local Ollama explanation second.</p>
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-95 disabled:opacity-60"
        >
          {loading ? "Analyzing…" : "Ask AI"}
        </button>
      </div>

      {error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      </div>

      {loading ? <AnalysisSkeleton /> : <AnalysisResultCard analysis={analysis} />}
      {analysisText && !analysis ? <div className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6">{analysisText}</div> : null}
    </aside>
  );
}

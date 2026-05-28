"use client";

import { ActivityAnalysis } from "@prisma/client";
import { useState } from "react";

export function AnalysisPanel({
  activityId,
  latestAnalysis
}: {
  activityId: string;
  latestAnalysis: ActivityAnalysis | null;
}) {
  const [analysisText, setAnalysisText] = useState(latestAnalysis?.analysisText ?? "");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="rounded-lg border bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Coach analysis</h2>
          <p className="text-sm text-muted">Uses local Ollama, with rule-based fallback.</p>
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Ask AI"}
        </button>
      </div>

      {error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="mt-4 whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-6">
        {analysisText || "No analysis yet. Click Ask AI to fetch detail/streams and generate the first ride analysis."}
      </div>
    </aside>
  );
}

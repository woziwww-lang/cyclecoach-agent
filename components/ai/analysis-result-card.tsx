import type { ActivityAnalysis } from "@prisma/client";
import { AnalysisResultSchema, type AnalysisResult } from "@/lib/analysis/analysis-schema";
import { AnalysisSection } from "@/components/ai/analysis-section";
import { ConfidenceBadge } from "@/components/ai/confidence-badge";
import { EffortTypePill } from "@/components/ai/effort-type-pill";

export function AnalysisResultCard({ analysis }: { analysis: ActivityAnalysis | null }) {
  const result = parseAnalysis(analysis);

  if (!analysis || !result) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-5 text-sm text-muted">
        No analysis yet. Ask the coach to analyze this ride.
      </div>
    );
  }

  return (
    <article className="space-y-4 rounded-3xl border bg-white p-4 shadow-soft">
      <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <EffortTypePill type={result.effortType} />
          <ConfidenceBadge level={result.confidence.level} />
          {result.fallbackUsed ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-muted">fallback used</span> : null}
        </div>
        <h2 className="mt-4 text-xl font-semibold leading-7">{result.overallVerdict}</h2>
      </div>

      <AnalysisSection icon="↯" title="Key Metrics">
        <div className="grid gap-2 sm:grid-cols-2">
          {result.keyMetrics.map((metric) => (
            <div key={`${metric.label}-${metric.value}`} className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-muted">{metric.label}</p>
              <p className="mt-1 font-semibold text-ink">{metric.value}</p>
              {metric.note ? <p className="mt-1 text-xs text-muted">{metric.note}</p> : null}
            </div>
          ))}
        </div>
      </AnalysisSection>

      <AnalysisSection icon="◎" title="Training Meaning">
        <p>{result.trainingMeaning}</p>
      </AnalysisSection>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalysisSection icon="✓" title="What Went Well">
          <BulletList items={result.wentWell} />
        </AnalysisSection>
        <AnalysisSection icon="↑" title="What To Improve">
          <BulletList items={result.toImprove} />
        </AnalysisSection>
      </div>

      <AnalysisSection icon="→" title="Next Ride">
        <p className="font-semibold text-ink">{result.nextRide.title}</p>
        <p className="mt-1">{result.nextRide.details}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.nextRide.duration ? <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{result.nextRide.duration}</span> : null}
          {result.nextRide.intensity ? <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{result.nextRide.intensity}</span> : null}
        </div>
      </AnalysisSection>

      <AnalysisSection icon="◌" title="Recovery">
        <BulletList items={result.recovery} />
      </AnalysisSection>

      <AnalysisSection icon="?" title="Confidence & Missing Data">
        <p className="font-medium text-ink">{result.confidence.reason}</p>
        {result.missingData.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {result.missingData.map((item) => (
              <li key={item} className="rounded-xl bg-amber-50 px-3 py-2 text-amber-800">{item}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-muted">No major missing-data warnings.</p>
        )}
        <p className="mt-3 text-xs text-muted">{result.disclaimer}</p>
      </AnalysisSection>
    </article>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-muted">No specific notes.</p>;
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function parseAnalysis(analysis: ActivityAnalysis | null): AnalysisResult | null {
  if (!analysis?.analysisJson) return null;
  try {
    const parsed = AnalysisResultSchema.safeParse(JSON.parse(analysis.analysisJson));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

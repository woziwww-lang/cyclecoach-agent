import { AnalysisResult, AnalysisResultSchema } from "@/lib/analysis/analysis-schema";

export function parseAnalysisResponse(text: string, fallback: AnalysisResult): AnalysisResult {
  const jsonText = extractJson(text);
  if (!jsonText) return fallback;

  try {
    const parsed = AnalysisResultSchema.safeParse(JSON.parse(jsonText));
    if (!parsed.success) return fallback;
    return { ...parsed.data, fallbackUsed: false };
  } catch {
    return fallback;
  }
}

function extractJson(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1];
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  return text.slice(first, last + 1);
}

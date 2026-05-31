import type { z } from "zod";

export function parseJsonWithSchema<T>(text: string, schema: z.ZodType<T>, fallback: T): T {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return fallback;
  try {
    return schema.parse(JSON.parse(trimmed.slice(start, end + 1)));
  } catch {
    return fallback;
  }
}

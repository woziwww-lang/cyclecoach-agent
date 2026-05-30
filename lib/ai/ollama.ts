import type { AiProvider } from "@/lib/ai/provider";

export class OllamaProvider implements AiProvider {
  constructor(
    private readonly baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
    private readonly model = process.env.OLLAMA_MODEL ?? "qwen2.5:7b"
  ) {}

  async generateText(input: { system: string; prompt: string }) {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.prompt }
        ]
      })
    });

    if (!res.ok) throw new Error(`OLLAMA_UNAVAILABLE:${res.status}`);
    const json = await res.json();
    return json.message?.content ?? "";
  }
}

export async function getOllamaHealth(config?: { baseUrl?: string; model?: string }) {
  const baseUrl = config?.baseUrl ?? process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = config?.model ?? process.env.OLLAMA_MODEL ?? "qwen2.5:7b";
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { cache: "no-store" });
    if (!res.ok) return { ok: false, model, error: `OLLAMA_HTTP_${res.status}` };
    const json = await res.json();
    const models = Array.isArray(json.models) ? json.models : [];
    const hasModel = models.some((item: { name?: string; model?: string }) => item.name === model || item.model === model);
    return { ok: hasModel, model, missingModel: !hasModel, availableModels: models.map((item: { name?: string }) => item.name).filter(Boolean) };
  } catch (error) {
    return { ok: false, model, error: error instanceof Error ? error.message : String(error) };
  }
}

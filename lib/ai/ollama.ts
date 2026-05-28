import { AiProvider } from "@/lib/ai/provider";

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

export async function getOllamaHealth() {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { cache: "no-store" });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

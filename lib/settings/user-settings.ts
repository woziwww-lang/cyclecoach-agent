import { prisma } from "@/lib/db/prisma";

export async function getOrCreateUserSettings(userId: string) {
  return prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      language: "en",
      llmProvider: "ollama",
      ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
      ollamaModel: process.env.OLLAMA_MODEL ?? "qwen2.5:7b",
      preferredUnits: "metric"
    }
  });
}

export async function getEffectiveOllamaConfig(userId?: string | null) {
  if (!userId) {
    return {
      baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
      model: process.env.OLLAMA_MODEL ?? "qwen2.5:7b"
    };
  }

  const settings = await getOrCreateUserSettings(userId);
  return {
    baseUrl: settings.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: settings.ollamaModel || process.env.OLLAMA_MODEL || "qwen2.5:7b"
  };
}

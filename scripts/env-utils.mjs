import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export function readLocalEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return {};

  const result = {};
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    result[key] = rawValue.replace(/^["']|["']$/g, "");
  }
  return result;
}

export function getOllamaConfig() {
  const localEnv = readLocalEnv();
  return {
    baseUrl: process.env.OLLAMA_BASE_URL || localEnv.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || localEnv.OLLAMA_MODEL || "qwen2.5:7b"
  };
}

import { spawnSync } from "node:child_process";
import { getOllamaConfig } from "./env-utils.mjs";

const { model } = getOllamaConfig();
console.log(`Pulling Ollama model configured for the app: ${model}`);

const result = spawnSync("docker", ["compose", "exec", "ollama", "ollama", "pull", model], {
  stdio: "inherit"
});

process.exit(result.status ?? 1);

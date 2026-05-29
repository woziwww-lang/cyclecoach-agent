import { getOllamaConfig } from "./env-utils.mjs";

const { baseUrl, model } = getOllamaConfig();

console.log(`Checking Ollama at ${baseUrl}`);
console.log(`App-configured model: ${model}`);

const tags = await fetch(`${baseUrl}/api/tags`).then((res) => {
  if (!res.ok) throw new Error(`Ollama tags failed: ${res.status}`);
  return res.json();
});

const models = Array.isArray(tags.models) ? tags.models.map((item) => item.name || item.model).filter(Boolean) : [];
console.log(`Installed models: ${models.length ? models.join(", ") : "(none)"}`);

if (!models.includes(model)) {
  console.error(`Configured model is not installed: ${model}`);
  console.error(`Run: pnpm ollama:pull`);
  process.exit(1);
}

const response = await fetch(`${baseUrl}/api/chat`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    model,
    stream: false,
    messages: [{ role: "user", content: "Reply with exactly: CycleCoach OK" }]
  })
});

if (!response.ok) {
  throw new Error(`Ollama chat failed: ${response.status}`);
}

const json = await response.json();
console.log(`Model response: ${json.message?.content ?? "(empty)"}`);

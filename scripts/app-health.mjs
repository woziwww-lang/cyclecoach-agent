const appUrl = process.env.APP_URL || "http://localhost:3000";

async function check(path) {
  const url = `${appUrl}${path}`;
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${path} failed with ${res.status}: ${text.slice(0, 200)}`);
  }
  console.log(`${path}: ${text.slice(0, 300)}`);
}

console.log(`Checking CycleCoach app at ${appUrl}`);
await check("/api/health");
await check("/api/llm/health");

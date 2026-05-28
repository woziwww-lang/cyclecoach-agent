import { getCurrentUser } from "@/lib/auth/session";
import { getOllamaHealth } from "@/lib/ai/ollama";

export default async function HomePage() {
  const user = await getCurrentUser();
  const ollama = await getOllamaHealth();

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-6">
        <div className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-brand">
          MVP vertical slice
        </div>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          Strava-first AI ride analysis, running locally.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted">
          Connect Strava, sync your latest cycling activities, choose one ride,
          and let local Ollama generate a data-grounded training analysis.
        </p>
        <div className="flex flex-wrap gap-3">
          {user ? (
            <a className="rounded-md bg-brand px-5 py-3 font-medium text-white" href="/activities">
              View activities
            </a>
          ) : (
            <a className="rounded-md bg-brand px-5 py-3 font-medium text-white" href="/api/auth/strava">
              Connect Strava
            </a>
          )}
          <a className="rounded-md border bg-white px-5 py-3 font-medium" href="/dashboard">
            Open dashboard
          </a>
        </div>
      </section>

      <aside className="rounded-lg border bg-white p-5 shadow-soft">
        <h2 className="font-semibold">Local status</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Strava session</dt>
            <dd className="font-medium">{user ? "connected" : "not connected"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Ollama</dt>
            <dd className={ollama.ok ? "font-medium text-green-700" : "font-medium text-red-700"}>
              {ollama.ok ? "connected" : "not connected"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Model</dt>
            <dd className="font-medium">{process.env.OLLAMA_MODEL ?? "qwen2.5:7b"}</dd>
          </div>
        </dl>
      </aside>
    </main>
  );
}

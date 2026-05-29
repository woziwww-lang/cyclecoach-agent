import { getOllamaHealth } from "@/lib/ai/ollama";
import { getEffectiveOllamaConfig } from "@/lib/settings/user-settings";
import { prisma } from "@/lib/db/prisma";
import { ActionCard } from "@/components/ui/action-card";
import { StatusPill } from "@/components/ui/status-pill";
import { getServerI18n } from "@/lib/i18n/server";

export default async function HomePage() {
  const { user, dictionary } = await getServerI18n();
  const t = dictionary.home;
  const config = await getEffectiveOllamaConfig(user?.id);
  const ollama = await getOllamaHealth(config);
  const latestRide = user
    ? await prisma.stravaActivity.findFirst({
        where: { userId: user.id },
        orderBy: { startDate: "desc" }
      })
    : null;

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:py-14">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="orange">{t.badgeLocal}</StatusPill>
            <StatusPill tone={user ? "green" : "slate"}>{user ? t.stravaConnected : t.stravaDisconnected}</StatusPill>
            <StatusPill tone={ollama.ok ? "green" : "red"}>{ollama.ok ? t.ollamaReady : t.ollamaAttention}</StatusPill>
          </div>
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              {t.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              {t.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <a className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-95" href={latestRide ? `/dashboard?activityId=${latestRide.id}` : "/dashboard"}>
                {latestRide ? t.analyzeLatest : t.openDashboard}
              </a>
            ) : (
              <a className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-95" href="/register">
                {t.createAccount}
              </a>
            )}
            <a className="rounded-2xl border bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:bg-slate-50" href="/coach">
              {t.askCoach}
            </a>
          </div>
        </div>

        <aside className="rounded-3xl border bg-white p-5 shadow-soft">
          <h2 className="font-semibold">{t.localStatus}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <StatusRow label="Strava session" value={user ? "connected" : "not connected"} />
            <StatusRow label="Ollama" value={ollama.ok ? "connected" : ollama.missingModel ? "model missing" : "not connected"} />
            <StatusRow label={t.model} value={config.model} />
            <StatusRow label={t.latestRide} value={latestRide?.name ?? t.noneCached} />
          </dl>
          {!ollama.ok ? (
            <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-amber-800">
              Start Ollama and pull the configured model. For 7B: <code>ollama pull qwen2.5:7b</code>
            </p>
          ) : null}
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard href="/coach" title={t.actionTalk} description={t.actionTalkDesc} icon="✦" meta="chat" />
        <ActionCard href="/dashboard" title={t.actionDashboard} description={t.actionDashboardDesc} icon="⌁" meta="data" primary />
        <ActionCard href="/dashboard?focus=latest" title={t.actionLatest} description={t.actionLatestDesc} icon="↯" meta={latestRide ? "ready" : "needs sync"} />
        <ActionCard href={user ? "/me" : "/register"} title={t.actionMe} description={t.actionMeDesc} icon="◌" meta="settings" />
      </section>
    </main>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[14rem] truncate text-right font-medium">{value}</dd>
    </div>
  );
}

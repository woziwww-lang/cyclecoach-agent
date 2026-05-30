import { getOllamaHealth } from "@/lib/ai/ollama";
import { getEffectiveOllamaConfig } from "@/lib/settings/user-settings";
import { prisma } from "@/lib/db/prisma";
import { ActionCard } from "@/components/ui/action-card";
import { StatusPill } from "@/components/ui/status-pill";
import { getServerI18n } from "@/lib/i18n/server";
import { CoachIcon, DashboardIcon, PlannerIcon, SparkIcon, UserSettingsIcon } from "@/components/ui/icons";

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
    <main className="cc-container space-y-8 md:space-y-10">
      <section className="cc-kinetic-bg grid gap-6 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)] md:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
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
        </div>

        <aside className="cc-card p-5">
          <div className="flex items-center gap-3">
            <span className="cc-icon-tile bg-orange-50 text-brand">
              <SparkIcon className="size-5" />
            </span>
            <h2 className="font-semibold">{t.localStatus}</h2>
          </div>
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
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-muted">
            {user ? (latestRide ? "Next step: open Ride Dashboard and review your latest synced ride." : "Next step: connect Strava from My Page, then sync your first activities.") : "Next step: create a local account, then manage Strava from My Page."}
          </p>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ActionCard href="/coach" title={t.actionTalk} description={t.actionTalkDesc} icon={<CoachIcon className="size-5" />} meta="chat" />
        <ActionCard href="/dashboard" title={t.actionDashboard} description={t.actionDashboardDesc} icon={<DashboardIcon className="size-5" />} meta="data" primary />
        <ActionCard href="/planner" title={t.actionPlan} description={t.actionPlanDesc} icon={<PlannerIcon className="size-5" />} meta="workout" />
        <ActionCard href={user ? "/me" : "/register"} title={t.actionMe} description={t.actionMeDesc} icon={<UserSettingsIcon className="size-5" />} meta="settings" />
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

"use client";

import type { RiderProfile } from "@/features/analytics/schemas/rider-profile.schema";
import { RiderTypeRadar } from "@/features/analytics/components/rider-type-radar";
import { StatusPill } from "@/components/ui/status-pill";

export function RiderTypeCard({ profile }: { profile: RiderProfile }) {
  return (
    <article className="cc-card overflow-hidden">
      <div className="border-b border-slate-100 bg-orange-50/55 p-5">
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="orange">{profile.riderType.replace("_", " ")}</StatusPill>
          <StatusPill tone={profile.confidence === "high" ? "green" : profile.confidence === "medium" ? "orange" : "slate"}>{profile.confidence} confidence</StatusPill>
        </div>
        <h2 className="mt-4 text-xl font-semibold">Rider Type Analyzer</h2>
        <p className="mt-2 text-sm leading-6 text-muted">A lightweight profile from your synced riding patterns. It avoids FTP or medical claims unless the data supports them.</p>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <RiderTypeRadar profile={profile} />
        <div className="space-y-4">
          <MiniList title="Evidence" items={profile.evidence} />
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniList title="Strengths" items={profile.strengths} />
            <MiniList title="Limiters" items={profile.limiters} />
          </div>
          <MiniList title="Best route types" items={profile.bestRoutes} />
          <MiniList title="Next focus" items={[...profile.trainingFocus, profile.nextExperiment]} />
          {profile.missingData.length ? <MiniList title="Missing data" items={profile.missingData} muted /> : null}
        </div>
      </div>
    </article>
  );
}

function MiniList({ title, items, muted = false }: { title: string; items: string[]; muted?: boolean }) {
  return (
    <div className={muted ? "rounded-2xl bg-slate-50 p-3" : "rounded-2xl border border-slate-200 bg-white p-3"}>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-2 space-y-1 text-sm leading-6 text-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { StatusPill } from "@/components/ui/status-pill";
import { useStravaStatusQuery } from "@/lib/api/strava";

export function StravaSettingsCard() {
  const statusQuery = useStravaStatusQuery();
  const connected = Boolean(statusQuery.data?.connected);

  return (
    <section className="rounded-3xl border bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Strava</h2>
          <p className="mt-1 text-sm text-muted">Tokens stay server-side in local SQLite for this MVP.</p>
        </div>
        <StatusPill tone={connected ? "green" : "slate"}>{connected ? "connected" : "not connected"}</StatusPill>
      </div>
      {connected ? (
        <div className="mt-4 space-y-3 text-sm">
          <p><span className="text-muted">Athlete:</span> {statusQuery.data?.account?.displayName ?? "Strava rider"}</p>
          <p><span className="text-muted">Last sync:</span> {statusQuery.data?.account?.lastSyncedAt ? new Date(statusQuery.data.account.lastSyncedAt).toLocaleString() : "not synced yet"}</p>
          <form action="/api/auth/strava/disconnect" method="post">
            <button className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Disconnect Strava</button>
          </form>
        </div>
      ) : (
        <a href="/api/auth/strava" className="mt-4 inline-flex rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white">Connect Strava</a>
      )}
    </section>
  );
}

"use client";

import { StatusPill } from "@/components/ui/status-pill";
import { ButtonLink, buttonClassName } from "@/components/ui/button";
import { useStravaStatusQuery } from "@/lib/api/strava";

export function StravaSettingsCard() {
  const statusQuery = useStravaStatusQuery();
  const connected = Boolean(statusQuery.data?.connected);

  return (
    <section className="cc-card p-5">
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
            <button type="submit" className={buttonClassName("danger")}>Disconnect Strava</button>
          </form>
        </div>
      ) : (
        <ButtonLink href="/api/auth/strava" className="mt-4">Connect Strava</ButtonLink>
      )}
    </section>
  );
}

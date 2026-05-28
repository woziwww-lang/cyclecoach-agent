import { StravaActivityStream } from "@prisma/client";

export function StreamSummary({ stream }: { stream: StravaActivityStream | null }) {
  const keys = parseKeys(stream?.availableKeys);

  return (
    <section className="rounded-lg border bg-white p-4 shadow-soft">
      <h2 className="font-semibold">Streams</h2>
      {keys.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          No streams cached yet. Click Refresh detail & streams or Ask AI to request them from Strava.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {keys.map((key) => (
            <span key={key} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
              {key}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function parseKeys(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

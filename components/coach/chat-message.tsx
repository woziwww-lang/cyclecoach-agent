import clsx from "clsx";
import { StatusPill } from "@/components/ui/status-pill";
import type { CoachChatResponse } from "@/lib/api/coach";

export function ChatMessage({ role, content, structured }: { role: "user" | "assistant"; content: string; structured?: CoachChatResponse["structured"] }) {
  return (
    <div className={clsx("flex gap-3", role === "user" && "justify-end")}>
      {role === "assistant" ? <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-brand">✦</div> : null}
      {role === "assistant" && structured ? (
        <StructuredCoachMessage response={structured} />
      ) : (
        <div
          className={clsx(
            "max-w-[86%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm",
            role === "user" ? "bg-brand text-white" : "border bg-white text-slate-800"
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

function StructuredCoachMessage({ response }: { response: NonNullable<CoachChatResponse["structured"]> }) {
  return (
    <article className="max-w-[92%] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-orange-50/60 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <StatusPill tone={response.confidence.level === "high" ? "green" : response.confidence.level === "medium" ? "orange" : "slate"}>{response.confidence.level} confidence</StatusPill>
          <StatusPill>coach answer</StatusPill>
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-ink">{response.directAnswer}</p>
      </div>
      <div className="grid gap-3 p-4 text-sm leading-6 sm:grid-cols-2">
        <Section title="Based on recent rides" items={response.basedOnRecentRides} />
        <Section title="Recommendation" items={response.recommendation} />
        <Section title="Why" items={response.why} />
        <Section title="What to watch" items={response.whatToWatch} />
      </div>
      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-muted">
        <p><span className="font-semibold text-ink">Next action:</span> {response.nextAction}</p>
        <p className="mt-1"><span className="font-semibold text-ink">Confidence:</span> {response.confidence.reason}</p>
        {response.missingData.length ? <p className="mt-1"><span className="font-semibold text-ink">Missing:</span> {response.missingData.join("; ")}</p> : null}
        <p className="mt-2 text-xs">{response.disclaimer}</p>
      </div>
    </article>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="font-semibold text-ink">{title}</p>
      <ul className="mt-2 space-y-1 text-muted">
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

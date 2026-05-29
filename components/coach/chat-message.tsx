import clsx from "clsx";

export function ChatMessage({ role, content }: { role: "user" | "assistant"; content: string }) {
  return (
    <div className={clsx("flex gap-3", role === "user" && "justify-end")}>
      {role === "assistant" ? <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-brand">✦</div> : null}
      <div
        className={clsx(
          "max-w-[86%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm",
          role === "user" ? "bg-brand text-white" : "border bg-white text-slate-800"
        )}
      >
        {content}
      </div>
    </div>
  );
}

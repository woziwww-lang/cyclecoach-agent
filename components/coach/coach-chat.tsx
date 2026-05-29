"use client";

import { FormEvent, useState } from "react";
import { ChatMessage } from "@/components/coach/chat-message";
import { ChatSkeleton } from "@/components/coach/chat-skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { useActivitiesQuery } from "@/lib/api/activities";
import { useCoachChatMutation } from "@/lib/api/coach";
import { useLlmHealthQuery } from "@/lib/api/settings";
import { useChatStore } from "@/lib/stores/use-chat-store";

type Message = { role: "user" | "assistant"; content: string };

const prompts = [
  "Analyze my latest ride",
  "How should I recover today?",
  "Plan a 90-minute endurance ride",
  "Explain Z2 training"
];

export function CoachChat() {
  const { draft, setDraft, activityId, setActivityId } = useChatStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const chatMutation = useCoachChatMutation();
  const activitiesQuery = useActivitiesQuery();
  const healthQuery = useLlmHealthQuery();
  const activities = activitiesQuery.data?.activities ?? [];

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const message = draft.trim();
    if (!message) return;
    setMessages((current) => [...current, { role: "user", content: message }]);
    setDraft("");
    try {
      const response = await chatMutation.mutateAsync({ message, activityId });
      setMessages((current) => [...current, { role: "assistant", content: response.message }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: `Coach is unavailable: ${error instanceof Error ? error.message : String(error)}` }
      ]);
    }
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-5 px-4 py-8 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <section className="rounded-3xl border bg-white p-4 shadow-soft">
          <h2 className="font-semibold">Coach context</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill tone={healthQuery.data?.ollama.ok ? "green" : "red"}>{healthQuery.data?.ollama.ok ? "model ready" : "model offline"}</StatusPill>
            <StatusPill>{healthQuery.data?.ollama.model ?? "qwen2.5:7b"}</StatusPill>
          </div>
          <label className="mt-4 block text-sm font-medium">Attach ride</label>
          <select
            value={activityId ?? ""}
            onChange={(event) => setActivityId(event.target.value || null)}
            className="mt-2 w-full rounded-2xl border bg-white px-3 py-2 text-sm"
          >
            <option value="">No activity selected</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>{activity.name}</option>
            ))}
          </select>
        </section>
      </aside>

      <section className="flex min-h-[72vh] flex-col rounded-3xl border bg-white shadow-soft">
        <div className="border-b border-slate-100 p-5">
          <h1 className="text-2xl font-semibold">AI Coach Chat</h1>
          <p className="mt-1 text-sm text-muted">Ask general sports questions or attach a synced ride for context. Not medical advice.</p>
        </div>

        <div className="cc-scrollbar flex-1 space-y-4 overflow-auto p-5">
          {messages.length === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {prompts.map((prompt) => (
                <button key={prompt} onClick={() => setDraft(prompt)} className="rounded-2xl border bg-slate-50 p-4 text-left text-sm font-medium transition hover:border-brand/40 hover:bg-orange-50">
                  {prompt}
                </button>
              ))}
            </div>
          ) : (
            messages.map((message, index) => <ChatMessage key={`${message.role}-${index}`} role={message.role} content={message.content} />)
          )}
          {chatMutation.isPending ? <ChatSkeleton /> : null}
        </div>

        <form onSubmit={submit} className="border-t border-slate-100 p-4">
          <div className="flex gap-2 rounded-3xl border bg-slate-50 p-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about training, recovery, nutrition, gear, or this ride…"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <button disabled={chatMutation.isPending} className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-60">
              Send
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

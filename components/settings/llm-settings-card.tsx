"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { StatusPill } from "@/components/ui/status-pill";
import { useLlmHealthQuery, useSettingsQuery, useUpdateSettingsMutation } from "@/lib/api/settings";

const LlmSettingsSchema = z.object({
  ollamaBaseUrl: z.string().url(),
  ollamaModel: z.string().min(1).max(80)
});

type LlmSettingsInput = z.infer<typeof LlmSettingsSchema>;

export function LlmSettingsCard() {
  const settingsQuery = useSettingsQuery();
  const healthQuery = useLlmHealthQuery();
  const updateSettings = useUpdateSettingsMutation();
  const form = useForm<LlmSettingsInput>({
    values: {
      ollamaBaseUrl: settingsQuery.data?.settings.ollamaBaseUrl ?? "http://localhost:11434",
      ollamaModel: settingsQuery.data?.settings.ollamaModel ?? "qwen2.5:7b"
    }
  });

  function submit(values: LlmSettingsInput) {
    const parsed = LlmSettingsSchema.safeParse(values);
    if (!parsed.success) return;
    updateSettings.mutate(parsed.data);
  }

  return (
    <section className="rounded-3xl border bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Local LLM</h2>
          <p className="mt-1 text-sm text-muted">Default is 7B. Switch lower if your machine struggles.</p>
        </div>
        <StatusPill tone={healthQuery.data?.ollama.ok ? "green" : "red"}>
          {healthQuery.data?.ollama.ok ? "connected" : healthQuery.data?.ollama.missingModel ? "model missing" : "offline"}
        </StatusPill>
      </div>

      <form onSubmit={form.handleSubmit(submit)} className="mt-5 grid gap-3">
        <label className="grid gap-1 text-sm font-medium">
          Ollama base URL
          <input className="rounded-2xl border bg-white px-3 py-2 font-normal" {...form.register("ollamaBaseUrl")} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Model name
          <input className="rounded-2xl border bg-white px-3 py-2 font-normal" placeholder="qwen2.5:7b" {...form.register("ollamaModel")} />
        </label>
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full bg-slate-100 px-2 py-1">7B: qwen2.5:7b</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">low: qwen2.5:3b</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">tiny: qwen2.5:0.5b</span>
        </div>
        <button disabled={updateSettings.isPending} className="mt-2 rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {updateSettings.isPending ? "Saving…" : "Save LLM settings"}
        </button>
      </form>

      {!healthQuery.data?.ollama.ok ? (
        <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-amber-800">
          If the model is missing, run <code>OLLAMA_MODEL={form.watch("ollamaModel") || "qwen2.5:7b"} pnpm ollama:pull</code>. If Ollama is offline, start it with <code>pnpm ollama:up</code>.
        </p>
      ) : null}
    </section>
  );
}

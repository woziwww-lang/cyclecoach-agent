"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
    <section className="cc-card p-5">
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
          <input className="rounded-2xl border border-slate-200 bg-white px-3 py-2 font-normal outline-none transition focus:border-brand/60" {...form.register("ollamaBaseUrl")} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Model name
          <input className="rounded-2xl border border-slate-200 bg-white px-3 py-2 font-normal outline-none transition focus:border-brand/60" placeholder="qwen2.5:7b" {...form.register("ollamaModel")} />
        </label>
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full bg-slate-100 px-2 py-1">7B: qwen2.5:7b</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">low: qwen2.5:3b</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">tiny: qwen2.5:0.5b</span>
        </div>
        <Button disabled={updateSettings.isPending} className="mt-2">
          {updateSettings.isPending ? "Saving…" : "Save LLM settings"}
        </Button>
        {updateSettings.isSuccess ? <p className="text-sm font-medium text-emerald-700">Settings saved.</p> : null}
      </form>

      {!healthQuery.data?.ollama.ok ? (
        <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-amber-800">
          If the model is missing, run <code>OLLAMA_MODEL={form.watch("ollamaModel") || "qwen2.5:7b"} pnpm ollama:pull</code>. If Ollama is offline, start it with <code>pnpm ollama:up</code>.
        </p>
      ) : null}
    </section>
  );
}

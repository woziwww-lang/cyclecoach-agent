"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useSettingsQuery, useUpdateSettingsMutation } from "@/lib/api/settings";
import { useAppStore } from "@/lib/stores/use-app-store";

const LanguageSchema = z.object({
  language: z.enum(["en", "zh", "ja"])
});

type LanguageInput = z.infer<typeof LanguageSchema>;

export function LanguageSettingsCard() {
  const settingsQuery = useSettingsQuery();
  const updateSettings = useUpdateSettingsMutation();
  const setLanguage = useAppStore((state) => state.setLanguage);
  const form = useForm<LanguageInput>({
    values: { language: (settingsQuery.data?.settings.language as "en" | "zh" | "ja" | undefined) ?? "en" }
  });

  function submit(values: LanguageInput) {
    const parsed = LanguageSchema.safeParse(values);
    if (!parsed.success) return;
    setLanguage(parsed.data.language);
    updateSettings.mutate(parsed.data);
  }

  return (
    <section className="cc-card p-5">
      <h2 className="font-semibold">Language</h2>
      <p className="mt-1 text-sm text-muted">MVP UI copy is mostly English; this setting prepares localization.</p>
      <form onSubmit={form.handleSubmit(submit)} className="mt-4 flex flex-wrap gap-2">
        {[
          ["en", "English"],
          ["zh", "中文"],
          ["ja", "日本語"]
        ].map(([value, label]) => (
          <label key={value} className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold transition has-[:checked]:border-brand has-[:checked]:bg-orange-50 has-[:checked]:text-brand">
            <input className="sr-only" type="radio" value={value} {...form.register("language")} />
            {label}
          </label>
        ))}
        <Button tone="secondary" disabled={updateSettings.isPending}>{updateSettings.isPending ? "Saving..." : "Save"}</Button>
      </form>
      {updateSettings.isSuccess ? <p className="mt-3 text-sm font-medium text-emerald-700">Language saved.</p> : null}
    </section>
  );
}

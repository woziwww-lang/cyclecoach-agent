import { Button } from "@/components/ui/button";

export function PrivacySettingsCard() {
  return (
    <section className="cc-card p-5">
      <h2 className="font-semibold">Privacy & local data</h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-muted">
        <p>Strava data is used only for your local ride analysis. This MVP does not train models on your activity data.</p>
        <p>Cloud LLM providers are not enabled. Ollama runs locally through your configured base URL.</p>
        <p>Production must encrypt refresh tokens; local MVP keeps tokens server-side in SQLite for simplicity.</p>
      </div>
      <Button tone="secondary" disabled className="mt-4">
        Clear cached activities coming soon
      </Button>
    </section>
  );
}

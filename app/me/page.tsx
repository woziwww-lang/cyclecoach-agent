import { LanguageSettingsCard } from "@/components/settings/language-settings-card";
import { LlmSettingsCard } from "@/components/settings/llm-settings-card";
import { PrivacySettingsCard } from "@/components/settings/privacy-settings-card";
import { StravaSettingsCard } from "@/components/settings/strava-settings-card";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="mx-auto flex min-h-[80vh] max-w-lg items-center px-4 py-10">
        <section className="cc-card p-6 text-center">
          <h1 className="text-2xl font-semibold">Sign in required</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Create a local account before connecting Strava or editing your local model settings.</p>
          <div className="mt-5 flex justify-center gap-3">
            <ButtonLink href="/login" tone="secondary">Log in</ButtonLink>
            <ButtonLink href="/register">Create account</ButtonLink>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="cc-container max-w-6xl space-y-6">
      <div>
        <p className="cc-section-label">Local settings</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">My Page</h1>
        <p className="mt-2 max-w-2xl text-muted">Manage Strava, local model settings, language, and privacy boundaries for the MVP.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <StravaSettingsCard />
        <LlmSettingsCard />
        <LanguageSettingsCard />
        <PrivacySettingsCard />
      </div>
    </main>
  );
}

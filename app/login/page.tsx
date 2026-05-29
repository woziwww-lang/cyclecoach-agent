import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-10">
      <section className="w-full rounded-3xl border bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <p className="mt-2 text-sm text-muted">Use your CycleCoach account, then connect your own Strava account.</p>
        {error ? <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">Login failed. Check your email and password.</p> : null}
        <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
          <label className="grid gap-1 text-sm font-medium">
            Email
            <input required type="email" name="email" className="rounded-2xl border px-3 py-2 font-normal" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Password
            <input required type="password" name="password" className="rounded-2xl border px-3 py-2 font-normal" />
          </label>
          <button className="w-full rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white">Log in</button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          No account? <a href="/register" className="font-semibold text-brand">Create one</a>
        </p>
      </section>
    </main>
  );
}

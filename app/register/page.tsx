import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { buttonClassName } from "@/components/ui/button";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-10">
      <section className="cc-card w-full p-6">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-muted">Register locally first. Strava connects after login, so each user owns their own data.</p>
        {error ? <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">Please use a valid email and a password with at least 8 characters.</p> : null}
        <form action="/api/auth/register" method="post" className="mt-6 space-y-4">
          <label className="grid gap-1 text-sm font-medium">
            Name
            <input name="name" className="rounded-2xl border border-slate-200 px-3 py-2 font-normal outline-none transition focus:border-brand/60" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Email
            <input required type="email" name="email" className="rounded-2xl border border-slate-200 px-3 py-2 font-normal outline-none transition focus:border-brand/60" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Password
            <input required minLength={8} type="password" name="password" className="rounded-2xl border border-slate-200 px-3 py-2 font-normal outline-none transition focus:border-brand/60" />
          </label>
          <button className={buttonClassName("primary", "w-full py-3")}>Create account</button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account? <a href="/login" className="font-semibold text-brand">Log in</a>
        </p>
      </section>
    </main>
  );
}

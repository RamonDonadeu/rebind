import { PLANS } from "@rebind/shared";

async function getApiHealth(): Promise<{ status: string; db: string } | null> {
  const apiUrl =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";
  try {
    const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const health = await getApiHealth();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-500">
          ReBind
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Digital Pokémon TCG Binders
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          Organize cards across binder pages. Search via TCGdex. Track your collection.
        </p>
      </div>

      <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          System status
        </h2>
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-400">API</dt>
            <dd className={health?.status === "ok" ? "text-green-400" : "text-amber-400"}>
              {health?.status ?? "unreachable"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">Database</dt>
            <dd className={health?.db === "ok" ? "text-green-400" : "text-amber-400"}>
              {health?.db ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">Free plan</dt>
            <dd>{PLANS.free.maxBinders} binder</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">Collector plan</dt>
            <dd>{PLANS.collector.maxBinders} binders</dd>
          </div>
        </dl>
      </div>

      <p className="text-center text-sm text-zinc-500">
        Phase 0 scaffold — see <code className="text-zinc-400">docs/PLAN.md</code> for roadmap.
      </p>
    </main>
  );
}

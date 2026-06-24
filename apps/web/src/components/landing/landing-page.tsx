import Link from "next/link";
import { PLANS } from "@rebind/shared";

const features = [
  {
    title: "Digital binder pages",
    description:
      "Create binders with up to 24 pages (or more on Collector). Each page uses a 3×3 or 3×4 grid — just like a real binder sheet.",
  },
  {
    title: "Search the full TCG catalog",
    description:
      "Find any Pokémon TCG card by name via TCGdex. Images and card data are loaded through ReBind — no third-party API keys needed.",
  },
  {
    title: "Slot-by-slot organization",
    description:
      "Place cards in exact slots, page by page. Reload anytime and your binder layout stays intact.",
  },
  {
    title: "Built for collectors",
    description:
      "Mirror physical collections digitally, track what goes where, and (coming soon) see approximate collection value.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-zinc-800/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <p className="text-sm font-semibold tracking-wide text-brand-500">ReBind</p>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-300 transition hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-500"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-500">
              Pokémon TCG collections
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
              Your cards. Your binders. Organized digitally.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-400 sm:text-xl">
              ReBind lets you build digital Pokémon TCG binders — page by page, slot by slot.
              Search cards, place them in a grid, and keep your collection organized without
              spreadsheets or camera rolls.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-500"
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-800/80 bg-zinc-900/20">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">What you can do</h2>
            <p className="mt-3 max-w-2xl text-zinc-400">
              ReBind is a hobby-scale organizer for personal collections — not a marketplace or
              trading platform. Focus on building binders that match how you collect in real life.
            </p>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <li
                  key={feature.title}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6"
                >
                  <h3 className="font-semibold text-zinc-100">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{feature.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-zinc-800/80">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Simple pricing</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
                <h3 className="text-lg font-semibold text-zinc-100">Free</h3>
                <p className="mt-2 text-3xl font-bold text-zinc-50">$0</p>
                <p className="mt-3 text-sm text-zinc-400">
                  {PLANS.free.maxBinders} binder, up to {PLANS.free.maxPagesPerBinder} pages, full
                  editing. Perfect to try ReBind with a single collection.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
                <h3 className="text-lg font-semibold text-zinc-100">Collector</h3>
                <p className="mt-2 text-3xl font-bold text-zinc-50">Paid</p>
                <p className="mt-3 text-sm text-zinc-400">
                  Up to {PLANS.collector.maxBinders} binders and {PLANS.collector.maxPagesPerBinder}{" "}
                  pages per binder. For serious collectors with multiple sets and projects.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-800/80 bg-zinc-900/20">
          <div className="mx-auto max-w-5xl px-6 py-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              Start your first binder today
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-zinc-400">
              Free to sign up. Search Pokémon TCG cards, fill your pages, and keep your collection
              organized in one place.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-500"
            >
              Get started free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800/80">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-500">
          <p>ReBind — digital Pokémon TCG binders</p>
          <p>Card data via TCGdex</p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BinderCard } from "@/components/binders/BinderCard";
import { CreateBinderDialog } from "@/components/binders/CreateBinderDialog";
import { useAuth } from "@/contexts/auth-context";
import { apiClient, ApiClientError } from "@/lib/api-client";
import type { BinderDetail, BinderLayout, BinderSummary } from "@/lib/binders";
import { maxPagesForLimits } from "@/lib/binders";
import { PLANS } from "@rebind/shared";

export default function BindersPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [binders, setBinders] = useState<BinderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const limits = user?.limits;
  const atBinderLimit = limits ? limits.currentBinders >= limits.maxBinders : false;
  const maxPages = maxPagesForLimits(limits?.maxBinders ?? PLANS.free.maxBinders);

  const loadBinders = useCallback(async () => {
    try {
      const data = await apiClient.get<BinderSummary[]>("/binders");
      setBinders(data);
      setError(null);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to load binders.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBinders();
  }, [loadBinders]);

  async function handleCreate(input: {
    name: string;
    pageCount: number;
    layout: BinderLayout;
  }) {
    const created = await apiClient.post<BinderDetail>("/binders", input);
    await refreshUser();
    await loadBinders();
    router.push(`/binders/${created.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your binders</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {limits
              ? `${limits.currentBinders} of ${limits.maxBinders} binders used`
              : "Manage your digital card binders"}
          </p>
        </div>

        <button
          type="button"
          disabled={atBinderLimit}
          onClick={() => setCreateOpen(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          New binder
        </button>
      </div>

      {atBinderLimit && (
        <p className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-400">
          Free plan includes {PLANS.free.maxBinders} binder
          {PLANS.free.maxBinders === 1 ? "" : "s"}.
          {limits && limits.maxBinders > PLANS.free.maxBinders
            ? " You are at your current plan limit."
            : " Upgrade to create more."}
        </p>
      )}

      {loading && <p className="text-sm text-zinc-500">Loading binders…</p>}

      {error && (
        <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {!loading && !error && binders.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-12 text-center">
          <p className="text-lg font-medium text-zinc-300">No binders yet</p>
          <p className="mt-2 text-sm text-zinc-500">
            Create your first binder to start placing cards.
          </p>
          {!atBinderLimit && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
            >
              Create binder
            </button>
          )}
        </div>
      )}

      {!loading && binders.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {binders.map((binder) => (
            <li key={binder.id}>
              <BinderCard binder={binder} />
            </li>
          ))}
        </ul>
      )}

      <CreateBinderDialog
        open={createOpen}
        maxPages={maxPages}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}

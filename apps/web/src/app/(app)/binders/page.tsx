"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiClient, ApiClientError } from "@/lib/api-client";

type BinderSummary = {
  id: string;
  name: string;
  pageCount: number;
  layout: string;
};

export default function BindersPage() {
  const { user } = useAuth();
  const [binders, setBinders] = useState<BinderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBinders() {
      try {
        const data = await apiClient.get<BinderSummary[]>("/binders");
        setBinders(data);
      } catch (err) {
        const message =
          err instanceof ApiClientError ? err.message : "Failed to load binders.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadBinders();
  }, []);

  const limits = user?.limits;

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
      </div>

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
            Binder creation and editing arrive in the next phase.
          </p>
        </div>
      )}

      {!loading && binders.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {binders.map((binder) => (
            <li
              key={binder.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <h2 className="font-semibold text-zinc-100">{binder.name}</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {binder.pageCount} pages · {binder.layout.replace("GRID_", "").replace("X", "×")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

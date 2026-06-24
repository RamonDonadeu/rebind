"use client";

import { useState, type FormEvent } from "react";
import type { BinderLayout } from "@/lib/binders";
import { ApiClientError } from "@/lib/api-client";

type CreateBinderDialogProps = {
  open: boolean;
  maxPages: number;
  onClose: () => void;
  onCreate: (input: { name: string; pageCount: number; layout: BinderLayout }) => Promise<void>;
};

export function CreateBinderDialog({ open, maxPages, onClose, onCreate }: CreateBinderDialogProps) {
  const [name, setName] = useState("");
  const [pageCount, setPageCount] = useState(24);
  const [layout, setLayout] = useState<BinderLayout>("GRID_3X3");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onCreate({ name: name.trim(), pageCount, layout });
      setName("");
      setPageCount(24);
      setLayout("GRID_3X3");
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to create binder.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div
        className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-binder-title"
      >
        <h2 id="create-binder-title" className="text-lg font-semibold text-zinc-100">
          Create binder
        </h2>

        <form className="mt-5 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div>
            <label htmlFor="binder-name" className="mb-1.5 block text-sm text-zinc-400">
              Name
            </label>
            <input
              id="binder-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              placeholder="Base Set Collection"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="binder-pages" className="mb-1.5 block text-sm text-zinc-400">
              Pages
            </label>
            <input
              id="binder-pages"
              type="number"
              min={1}
              max={maxPages}
              value={pageCount}
              onChange={(event) => setPageCount(Number(event.target.value))}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <p className="mb-2 text-sm text-zinc-400">Layout</p>
            <div className="flex gap-3">
              {(["GRID_3X3", "GRID_3X4"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLayout(option)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                    layout === option
                      ? "border-brand-500 bg-brand-600/20 text-zinc-100"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {option.replace("GRID_", "").replace("X", "×")}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || name.trim().length === 0}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

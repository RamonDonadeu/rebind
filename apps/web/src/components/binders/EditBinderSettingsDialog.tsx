"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { BinderDetail, BinderLayout } from "@/lib/binders";
import { countCardsOnRemovedPages } from "@/lib/binders";
import { ApiClientError } from "@/lib/api-client";

type EditBinderSettingsDialogProps = {
  open: boolean;
  binder: BinderDetail;
  maxPages: number;
  hasCards: boolean;
  onClose: () => void;
  onSave: (input: { pageCount: number; layout: BinderLayout }) => Promise<void>;
};

export function EditBinderSettingsDialog({
  open,
  binder,
  maxPages,
  hasCards,
  onClose,
  onSave,
}: EditBinderSettingsDialogProps) {
  const [pageCount, setPageCount] = useState(binder.pageCount);
  const [layout, setLayout] = useState<BinderLayout>(binder.layout);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPageCount(binder.pageCount);
      setLayout(binder.layout);
      setError(null);
      setSubmitting(false);
    }
  }, [open, binder.pageCount, binder.layout]);

  if (!open) {
    return null;
  }

  const shrinking = pageCount < binder.pageCount;
  const layoutChanged = layout !== binder.layout;
  const cardsOnRemovedPages = countCardsOnRemovedPages(binder, pageCount);
  const willLoseCards = shrinking && cardsOnRemovedPages > 0;
  const layoutBlocked = layoutChanged && hasCards;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (layoutBlocked) {
      return;
    }

    if (willLoseCards) {
      const confirmed = window.confirm(
        `Reducing pages will remove ${cardsOnRemovedPages} card${cardsOnRemovedPages === 1 ? "" : "s"} on removed pages. Continue?`
      );
      if (!confirmed) {
        return;
      }
    }

    setError(null);
    setSubmitting(true);

    try {
      const updates: { pageCount?: number; layout?: BinderLayout } = {};

      if (pageCount !== binder.pageCount) {
        updates.pageCount = pageCount;
      }

      if (layoutChanged) {
        updates.layout = layout;
      }

      if (Object.keys(updates).length === 0) {
        onClose();
        return;
      }

      await onSave({ pageCount, layout });
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to update binder settings.";
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
        aria-labelledby="edit-binder-settings-title"
      >
        <h2 id="edit-binder-settings-title" className="text-lg font-semibold text-zinc-100">
          Binder settings
        </h2>

        <form className="mt-5 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div>
            <label htmlFor="edit-binder-pages" className="mb-1.5 block text-sm text-zinc-400">
              Pages
            </label>
            <input
              id="edit-binder-pages"
              type="number"
              min={1}
              max={maxPages}
              value={pageCount}
              onChange={(event) => setPageCount(Number(event.target.value))}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {willLoseCards && (
              <p className="mt-2 text-sm text-amber-300">
                {cardsOnRemovedPages} card{cardsOnRemovedPages === 1 ? "" : "s"} will be removed
                from pages beyond {pageCount}.
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm text-zinc-400">Layout</p>
            <div className="flex gap-3">
              {(["GRID_3X3", "GRID_3X4"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={hasCards && option !== binder.layout}
                  onClick={() => setLayout(option)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    layout === option
                      ? "border-brand-500 bg-brand-600/20 text-zinc-100"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {option.replace("GRID_", "").replace("X", "×")}
                </button>
              ))}
            </div>
            {layoutBlocked && (
              <p className="mt-2 text-sm text-amber-300">
                Clear all cards before changing layout.
              </p>
            )}
            {layoutChanged && !hasCards && (
              <p className="mt-2 text-sm text-amber-300">
                Changing layout will reset all empty slot positions.
              </p>
            )}
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
              disabled={submitting || layoutBlocked}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

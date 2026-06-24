"use client";

import { useEffect, useState, type FormEvent } from "react";

type DeleteBinderDialogProps = {
  open: boolean;
  binderName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteBinderDialog({
  open,
  binderName,
  onClose,
  onConfirm,
}: DeleteBinderDialogProps) {
  const [confirmName, setConfirmName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameMatches = confirmName === binderName;

  useEffect(() => {
    if (!open) {
      setConfirmName("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nameMatches) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await onConfirm();
    } catch {
      setError("Failed to delete binder. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div
        className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-binder-title"
      >
        <h2 id="delete-binder-title" className="text-lg font-semibold text-zinc-100">
          Delete binder
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          This will permanently delete <span className="font-medium text-zinc-200">{binderName}</span>.
          Type the binder name to confirm.
        </p>

        <form className="mt-5 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div>
            <label htmlFor="delete-binder-confirm" className="mb-1.5 block text-sm text-zinc-400">
              Binder name
            </label>
            <input
              id="delete-binder-confirm"
              value={confirmName}
              onChange={(event) => setConfirmName(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder={binderName}
              autoFocus
              autoComplete="off"
            />
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
              disabled={submitting || !nameMatches}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
            >
              {submitting ? "Deleting…" : "Delete binder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

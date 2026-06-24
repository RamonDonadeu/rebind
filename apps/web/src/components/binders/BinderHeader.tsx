"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type BinderHeaderProps = {
  name: string;
  layoutLabel: string;
  pageCount: number;
  onRename: (name: string) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function BinderHeader({
  name,
  layoutLabel,
  pageCount,
  onRename,
  onDelete,
}: BinderHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [deleting, setDeleting] = useState(false);

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draftName.trim();

    if (!trimmed || trimmed === name) {
      setEditing(false);
      setDraftName(name);
      return;
    }

    await onRename(trimmed);
    setEditing(false);
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);

    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <Link href="/binders" className="text-sm text-zinc-500 transition hover:text-zinc-300">
          ← Back to binders
        </Link>

        {editing ? (
          <form className="flex flex-wrap items-center gap-2" onSubmit={(event) => void handleRename(event)}>
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-lg font-semibold text-zinc-100 outline-none focus:border-brand-500"
              maxLength={100}
              autoFocus
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-500"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setDraftName(name);
              }}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">{name}</h1>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              Rename
            </button>
          </div>
        )}

        <p className="text-sm text-zinc-500">
          {pageCount} pages · {layoutLabel}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={deleting}
        className="rounded-lg border border-red-900/50 px-3 py-1.5 text-sm text-red-300 transition hover:border-red-700 disabled:opacity-60"
      >
        {deleting ? "Deleting…" : "Delete binder"}
      </button>
    </div>
  );
}

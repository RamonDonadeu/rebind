"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { BinderOptionsMenu } from "@/components/binders/BinderOptionsMenu";
import { CardSizeControl } from "@/components/binders/CardSizeControl";
import type { CardSizeLevel } from "@/lib/card-size";
import type { PageViewMode } from "@/lib/binder-view";
import type { BinderDetail, BinderLayout } from "@/lib/binders";

type BinderHeaderProps = {
  binder: BinderDetail;
  layoutLabel: string;
  maxPages: number;
  cardSize: CardSizeLevel;
  onCardSizeChange: (size: CardSizeLevel) => void;
  pageViewMode: PageViewMode;
  onPageViewModeChange: (mode: PageViewMode) => void;
  onRename: (name: string) => Promise<void>;
  onDuplicate: () => Promise<void>;
  onSettingsSave: (input: { pageCount: number; layout: BinderLayout }) => Promise<void>;
  onDelete: () => Promise<void>;
  isMobile?: boolean;
};

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

export function BinderHeader({
  binder,
  layoutLabel,
  maxPages,
  cardSize,
  onCardSizeChange,
  pageViewMode,
  onPageViewModeChange,
  onRename,
  onDuplicate,
  onSettingsSave,
  onDelete,
  isMobile = false,
}: BinderHeaderProps) {
  const name = binder.name;
  const pageCount = binder.pageCount;
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);

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

  return (
    <header className="sticky top-0 z-10 -mt-4 shrink-0 border-b border-zinc-800/80 bg-[var(--background)]/95 pb-3 pt-4 backdrop-blur-sm sm:-mt-8 sm:pb-4 sm:pt-8">
      <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <Link href="/binders" className="text-sm text-zinc-500 transition hover:text-zinc-300">
            ← Back
          </Link>

          {editing ? (
            <form
              className="flex flex-wrap items-center gap-2"
              onSubmit={(event) => void handleRename(event)}
            >
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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
                {name}
              </h1>
              <button
                type="button"
                onClick={() => {
                  setDraftName(name);
                  setEditing(true);
                }}
                aria-label="Rename binder"
                className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
              >
                <PencilIcon />
              </button>
            </div>
          )}

          <p className="text-sm text-zinc-500">
            {pageCount} pages · {layoutLabel}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <div className="hidden sm:block">
            <CardSizeControl value={cardSize} onChange={onCardSizeChange} />
          </div>

          <BinderOptionsMenu
            binder={binder}
            maxPages={maxPages}
            pageViewMode={pageViewMode}
            showPageViewToggle={!isMobile}
            onPageViewModeChange={onPageViewModeChange}
            onDuplicate={onDuplicate}
            onSettingsSave={onSettingsSave}
            onDelete={onDelete}
          />
        </div>
      </div>
    </header>
  );
}

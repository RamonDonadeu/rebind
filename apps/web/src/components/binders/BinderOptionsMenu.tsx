"use client";

import { useEffect, useRef, useState } from "react";
import { DeleteBinderDialog } from "@/components/binders/DeleteBinderDialog";
import { PageViewModeControl } from "@/components/binders/PageViewModeControl";
import type { PageViewMode } from "@/lib/binder-view";

type BinderOptionsMenuProps = {
  binderName: string;
  pageViewMode: PageViewMode;
  onPageViewModeChange: (mode: PageViewMode) => void;
  onDelete: () => Promise<void>;
};

function GearIcon() {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function BinderOptionsMenu({
  binderName,
  pageViewMode,
  onPageViewModeChange,
  onDelete,
}: BinderOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label="Binder options"
          aria-expanded={open}
          aria-haspopup="menu"
          className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <GearIcon />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-xl"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Binder options
            </p>

            <PageViewModeControl
              value={pageViewMode}
              onChange={(mode) => {
                onPageViewModeChange(mode);
              }}
            />

            <div className="mt-3 border-t border-zinc-800 pt-3">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  setDeleteOpen(true);
                }}
                className="w-full rounded-lg px-2 py-2 text-left text-sm text-red-300 transition hover:bg-red-950/30"
              >
                Delete binder
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteBinderDialog
        open={deleteOpen}
        binderName={binderName}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onDelete}
      />
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { BinderSlot } from "@/lib/binders";

type SlotOptionsMenuProps = {
  slot: BinderSlot;
  onReplace: () => void;
  onToggleOwned: () => void;
  onClear: () => void;
};

function ThreeDotsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  );
}

export function SlotOptionsMenu({
  slot,
  onReplace,
  onToggleOwned,
  onClear,
}: SlotOptionsMenuProps) {
  const [open, setOpen] = useState(false);
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function runAction(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div ref={menuRef} className="absolute -right-3 -top-3 z-10">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        aria-label="Card options"
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex h-6 w-6 items-center justify-center rounded-full border border-zinc-600/80 bg-zinc-900/90 text-zinc-300 shadow-sm transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
        }`}
      >
        <ThreeDotsIcon />
      </button>

      {open && (
        <ul
          className="absolute right-0 top-full z-20 mt-1 min-w-[10.5rem] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl"
          role="menu"
        >
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onToggleOwned)}
              className="w-full px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-800"
            >
              {slot.owned ? "Mark not owned" : "Mark as owned"}
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onReplace)}
              className="w-full px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-800"
            >
              Change card
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onClear)}
              className="w-full px-3 py-2 text-left text-sm text-red-300 transition hover:bg-zinc-800"
            >
              Remove
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

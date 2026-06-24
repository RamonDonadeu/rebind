"use client";

import { useEffect, useRef } from "react";
import { CARD_VARIANT_ORDER, cardVariantLabel, type CardVariant } from "@rebind/shared";
import type { BinderSlot } from "@/lib/binders";

type SlotOptionsMenuProps = {
  slot: BinderSlot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplace: () => void;
  onToggleOwned: () => void;
  onVariantChange: (variant: CardVariant) => void;
  onClear: () => void;
  onMove?: () => void;
  showTrigger?: boolean;
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
  open,
  onOpenChange,
  onReplace,
  onToggleOwned,
  onVariantChange,
  onClear,
  onMove,
  showTrigger = true,
}: SlotOptionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerOutside(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("mousedown", handlePointerOutside);
    document.addEventListener("touchstart", handlePointerOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerOutside);
      document.removeEventListener("touchstart", handlePointerOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onOpenChange]);

  function runAction(action: () => void) {
    onOpenChange(false);
    action();
  }

  if (!showTrigger && !open) {
    return null;
  }

  if (!showTrigger && open) {
    return (
      <div
        ref={menuRef}
        className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/50 p-2"
        onClick={() => onOpenChange(false)}
      >
        <ul
          className="max-h-full w-full min-w-0 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl"
          role="menu"
          onClick={(event) => event.stopPropagation()}
        >
          {renderMenuItems()}
        </ul>
      </div>
    );
  }

  function renderMenuItems() {
    return (
      <>
        {onMove && (
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onMove)}
              className="w-full px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-800"
            >
              Move card
            </button>
          </li>
        )}
        <li role="none" className={onMove ? "border-t border-zinc-800" : undefined}>
          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onToggleOwned)}
            className="w-full px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-800"
          >
            {slot.owned ? "Mark not owned" : "Mark as owned"}
          </button>
        </li>
        <li role="none" className="border-t border-zinc-800">
          <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Variant
          </p>
          {CARD_VARIANT_ORDER.map((variant) => (
            <button
              key={variant}
              type="button"
              role="menuitemradio"
              aria-checked={slot.variant === variant}
              onClick={() => runAction(() => onVariantChange(variant))}
              className={`w-full px-3 py-1.5 text-left text-sm transition hover:bg-zinc-800 ${
                slot.variant === variant ? "text-brand-300" : "text-zinc-200"
              }`}
            >
              {cardVariantLabel(variant)}
              {slot.variant === variant ? " ✓" : ""}
            </button>
          ))}
        </li>
        <li role="none" className="border-t border-zinc-800">
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
      </>
    );
  }

  return (
    <div ref={menuRef} className="absolute right-0 top-0 z-10 sm:-right-3 sm:-top-3">
      {showTrigger && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenChange(!open);
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
      )}

      {open && (
        <ul
          className="absolute right-0 top-full z-50 mt-1 min-w-[10.5rem] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl"
          role="menu"
        >
          {renderMenuItems()}
        </ul>
      )}
    </div>
  );
}

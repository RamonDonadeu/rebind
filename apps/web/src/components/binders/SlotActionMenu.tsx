"use client";

import type { BinderSlot } from "@/lib/binders";

type SlotActionMenuProps = {
  slot: BinderSlot;
  onReplace: () => void;
  onClear: () => void;
  onClose: () => void;
};

export function SlotActionMenu({ slot, onReplace, onClear, onClose }: SlotActionMenuProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl">
        <h3 className="font-semibold text-zinc-100">{slot.cardName}</h3>
        <p className="mt-1 text-sm text-zinc-500">What would you like to do with this slot?</p>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onReplace}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
          >
            Replace card
          </button>
          <button
            type="button"
            onClick={() => void onClear()}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
          >
            Clear slot
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

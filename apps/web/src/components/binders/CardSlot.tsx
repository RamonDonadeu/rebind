"use client";

import { useState } from "react";
import type { BinderSlot } from "@/lib/binders";
import { SlotOptionsMenu } from "./SlotOptionsMenu";

type CardSlotProps = {
  slot: BinderSlot;
  onSelect: () => void;
  onReplace: () => void;
  onToggleOwned: () => void;
  onClear: () => void;
};

export function CardSlot({
  slot,
  onSelect,
  onReplace,
  onToggleOwned,
  onClear,
}: CardSlotProps) {
  const [imageError, setImageError] = useState(false);
  const filled = Boolean(slot.cardExternalId);
  const unownedClass = slot.owned ? "" : "grayscale transition duration-300 group-hover:grayscale-0";

  if (!filled) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="group relative aspect-[5/7] w-full overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-950/80 transition hover:border-brand-500/60 hover:ring-1 hover:ring-brand-500/40"
        aria-label="Empty slot"
      >
        <div className="flex h-full items-center justify-center">
          <span className="text-2xl text-zinc-700 transition group-hover:text-zinc-500">+</span>
        </div>
      </button>
    );
  }

  return (
    <div className="group relative aspect-[5/7] w-full overflow-visible">
      <SlotOptionsMenu
        slot={slot}
        onReplace={onReplace}
        onToggleOwned={onToggleOwned}
        onClear={onClear}
      />

      <div className="h-full w-full overflow-hidden rounded-lg">
        {slot.imageUrl && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slot.imageUrl}
            alt={slot.cardName ?? "Card"}
            loading="lazy"
            className={`h-full w-full object-contain ${unownedClass}`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`flex h-full flex-col items-center justify-center gap-1 bg-zinc-950/80 p-2 text-center ${unownedClass}`}
          >
            <span className="text-xs text-zinc-500">No image</span>
            <span className="line-clamp-2 text-xs font-medium text-zinc-300">{slot.cardName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

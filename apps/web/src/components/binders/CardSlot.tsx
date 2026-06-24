"use client";

import { useState } from "react";
import type { BinderSlot } from "@/lib/binders";

type CardSlotProps = {
  slot: BinderSlot;
  onSelect: () => void;
};

export function CardSlot({ slot, onSelect }: CardSlotProps) {
  const [imageError, setImageError] = useState(false);
  const filled = Boolean(slot.cardExternalId);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative aspect-[5/7] w-full overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-950/80 transition hover:border-brand-500/60 hover:ring-1 hover:ring-brand-500/40"
      aria-label={filled ? `Slot with ${slot.cardName}` : "Empty slot"}
    >
      {filled && slot.imageUrl && !imageError ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slot.imageUrl}
            alt={slot.cardName ?? "Card"}
            loading="lazy"
            className={`h-full w-full object-contain p-1 ${slot.owned ? "" : "opacity-60"}`}
            onError={() => setImageError(true)}
          />
          {!slot.owned && (
            <span className="absolute right-1 top-1 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-950">
              Need
            </span>
          )}
        </>
      ) : filled ? (
        <div
          className={`flex h-full flex-col items-center justify-center gap-1 p-2 text-center ${slot.owned ? "" : "opacity-60"}`}
        >
          {!slot.owned && (
            <span className="rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-950">
              Need
            </span>
          )}
          <span className="text-xs text-zinc-500">No image</span>
          <span className="line-clamp-2 text-xs font-medium text-zinc-300">{slot.cardName}</span>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-2xl text-zinc-700 transition group-hover:text-zinc-500">+</span>
        </div>
      )}
    </button>
  );
}

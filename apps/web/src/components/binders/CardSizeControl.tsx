"use client";

import { CARD_SIZE_LEVELS, type CardSizeLevel } from "@/lib/card-size";

type CardSizeControlProps = {
  value: CardSizeLevel;
  onChange: (size: CardSizeLevel) => void;
};

export function CardSizeControl({ value, onChange }: CardSizeControlProps) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="card-size-slider" className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Card size
      </label>
      <input
        id="card-size-slider"
        type="range"
        min={CARD_SIZE_LEVELS[0]}
        max={CARD_SIZE_LEVELS[CARD_SIZE_LEVELS.length - 1]}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) as CardSizeLevel)}
        aria-valuemin={CARD_SIZE_LEVELS[0]}
        aria-valuemax={CARD_SIZE_LEVELS[CARD_SIZE_LEVELS.length - 1]}
        aria-valuenow={value}
        className="h-1.5 w-28 cursor-pointer accent-brand-500"
      />
    </div>
  );
}

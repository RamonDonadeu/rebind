"use client";

import { CARD_SIZE_LEVELS, type CardSizeLevel } from "@/lib/card-size";

type CardSizeControlProps = {
  value: CardSizeLevel;
  onChange: (size: CardSizeLevel) => void;
};

const SIZE_BAR_HEIGHTS = [8, 11, 14, 17, 20] as const;

export function CardSizeControl({ value, onChange }: CardSizeControlProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Card size</span>
      <div
        className="inline-flex items-end gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1.5"
        role="group"
        aria-label="Card size"
      >
        {CARD_SIZE_LEVELS.map((level) => {
          const active = level === value;

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              aria-label={`Size ${level}`}
              aria-pressed={active}
              className={`flex h-9 w-9 items-end justify-center rounded-md transition ${
                active
                  ? "bg-brand-600/20 ring-1 ring-brand-500/60"
                  : "hover:bg-zinc-800/80"
              }`}
            >
              <span
                className={`w-3 rounded-sm transition-colors ${
                  active ? "bg-brand-500" : "bg-zinc-600"
                }`}
                style={{ height: SIZE_BAR_HEIGHTS[level - 1] }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

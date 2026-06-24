"use client";

import type { PageViewMode } from "@/lib/binder-view";

type PageViewModeControlProps = {
  value: PageViewMode;
  onChange: (mode: PageViewMode) => void;
};

const MODES: { value: PageViewMode; label: string }[] = [
  { value: "single", label: "single" },
  { value: "spread", label: "double" },
];

export function PageViewModeControl({ value, onChange }: PageViewModeControlProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-zinc-500">View</span>
      <div className="flex rounded-lg border border-zinc-800 p-0.5">
        {MODES.map((mode) => {
          const active = value === mode.value;

          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => onChange(mode.value)}
              aria-pressed={active}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                active
                  ? "bg-brand-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

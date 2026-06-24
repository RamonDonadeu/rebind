"use client";

import type { BinderLayout, BinderSlot } from "@/lib/binders";
import type { CardSizeLevel } from "@/lib/card-size";
import { BinderGrid } from "./BinderGrid";

type PageDirection = "next" | "prev";

type BinderPageViewProps = {
  layout: BinderLayout;
  slots: BinderSlot[];
  currentPage: number;
  totalPages: number;
  cardSize: CardSizeLevel;
  pageDirection: PageDirection | null;
  onPageChange: (page: number) => void;
  onSlotSelect: (slot: BinderSlot) => void;
};

function PageArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const label = direction === "prev" ? "Previous page" : "Next page";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="group flex h-12 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30 sm:h-14 sm:w-12"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 transition group-hover:scale-110"
        aria-hidden
      >
        {direction === "prev" ? (
          <path d="M15 18l-6-6 6-6" />
        ) : (
          <path d="M9 18l6-6-6-6" />
        )}
      </svg>
    </button>
  );
}

export function BinderPageView({
  layout,
  slots,
  currentPage,
  totalPages,
  cardSize,
  pageDirection,
  onPageChange,
  onSlotSelect,
}: BinderPageViewProps) {
  const animationClass =
    pageDirection === "next"
      ? "animate-page-slide-in-next"
      : pageDirection === "prev"
        ? "animate-page-slide-in-prev"
        : "";

  return (
    <div className="flex w-full items-center justify-center gap-2 sm:gap-4">
      <PageArrow
        direction="prev"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      />

      <div
        key={currentPage}
        className={`mx-auto w-full flex-1 ${animationClass}`}
      >
        <BinderGrid
          layout={layout}
          slots={slots}
          cardSize={cardSize}
          onSlotSelect={onSlotSelect}
        />
      </div>

      <PageArrow
        direction="next"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
    </div>
  );
}

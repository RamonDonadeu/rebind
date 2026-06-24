"use client";

import type { BinderLayout, BinderSlot } from "@/lib/binders";
import type { PageViewMode } from "@/lib/binder-view";
import type { CardSizeLevel } from "@/lib/card-size";
import { spreadPageWidthClass } from "@/lib/card-size";
import { BinderGrid } from "./BinderGrid";
import { EmptyPageGrid } from "./EmptyPageGrid";

type PageDirection = "next" | "prev";

type BinderPageViewProps = {
  layout: BinderLayout;
  viewMode: PageViewMode;
  slots: BinderSlot[];
  leftSlots?: BinderSlot[];
  rightSlots?: BinderSlot[];
  leftPage?: number | null;
  rightPage?: number | null;
  currentPage: number;
  currentSpreadIndex: number;
  totalPages: number;
  totalSpreads: number;
  cardSize: CardSizeLevel;
  pageDirection: PageDirection | null;
  onPageChange: (page: number) => void;
  onSpreadChange: (spreadIndex: number) => void;
  onSlotSelect: (slot: BinderSlot) => void;
  onSlotReplace: (slot: BinderSlot) => void;
  onSlotToggleOwned: (slot: BinderSlot) => void;
  onSlotClear: (slot: BinderSlot) => void;
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

function SpreadSide({
  side,
  pageNumber,
  slots,
  layout,
  cardSize,
  placeholderLabel,
  onSlotSelect,
  onSlotReplace,
  onSlotToggleOwned,
  onSlotClear,
}: {
  side: "left" | "right";
  pageNumber: number | null | undefined;
  slots?: BinderSlot[];
  layout: BinderLayout;
  cardSize: CardSizeLevel;
  placeholderLabel?: string;
  onSlotSelect: (slot: BinderSlot) => void;
  onSlotReplace: (slot: BinderSlot) => void;
  onSlotToggleOwned: (slot: BinderSlot) => void;
  onSlotClear: (slot: BinderSlot) => void;
}) {
  const hasPage = Boolean(pageNumber && slots);
  const pageAlign = hasPage
    ? side === "left"
      ? "justify-end"
      : "justify-start"
    : side === "left"
      ? "justify-start"
      : "justify-end";

  const heading = hasPage ? `Page ${pageNumber}` : placeholderLabel;

  return (
    <div className={`flex min-w-0 w-full ${pageAlign}`}>
      <div className={`min-w-0 ${spreadPageWidthClass(cardSize)}`}>
        {heading ? (
          <p className="mb-2 text-center text-xs font-medium text-zinc-500">{heading}</p>
        ) : (
          <div className="mb-2 h-4" aria-hidden />
        )}

        {hasPage && slots ? (
          <BinderGrid
            layout={layout}
            slots={slots}
            cardSize={cardSize}
            spread
            onSlotSelect={onSlotSelect}
            onSlotReplace={onSlotReplace}
            onSlotToggleOwned={onSlotToggleOwned}
            onSlotClear={onSlotClear}
          />
        ) : (
          <EmptyPageGrid layout={layout} />
        )}
      </div>
    </div>
  );
}

export function BinderPageView({
  layout,
  viewMode,
  slots,
  leftSlots,
  rightSlots,
  leftPage,
  rightPage,
  currentPage,
  currentSpreadIndex,
  totalPages,
  totalSpreads,
  cardSize,
  pageDirection,
  onPageChange,
  onSpreadChange,
  onSlotSelect,
  onSlotReplace,
  onSlotToggleOwned,
  onSlotClear,
}: BinderPageViewProps) {
  const animationClass =
    pageDirection === "next"
      ? "animate-page-slide-in-next"
      : pageDirection === "prev"
        ? "animate-page-slide-in-prev"
        : "";

  const isSpread = viewMode === "spread";
  const canGoPrev = isSpread ? currentSpreadIndex > 0 : currentPage > 1;
  const canGoNext = isSpread
    ? currentSpreadIndex < totalSpreads - 1
    : currentPage < totalPages;

  function handlePrev() {
    if (isSpread) {
      onSpreadChange(currentSpreadIndex - 1);
      return;
    }

    onPageChange(currentPage - 1);
  }

  function handleNext() {
    if (isSpread) {
      onSpreadChange(currentSpreadIndex + 1);
      return;
    }

    onPageChange(currentPage + 1);
  }

  const contentKey = isSpread ? `spread-${currentSpreadIndex}` : `page-${currentPage}`;

  return (
    <div className="flex w-full min-w-0 self-stretch items-center gap-2 sm:gap-4">
      <PageArrow direction="prev" disabled={!canGoPrev} onClick={handlePrev} />

      <div key={contentKey} className={`min-w-0 w-full flex-1 basis-0 ${animationClass}`}>
        {isSpread ? (
          <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-2 sm:gap-x-3">
            <SpreadSide
              side="left"
              pageNumber={leftPage}
              slots={leftSlots}
              layout={layout}
              cardSize={cardSize}
              placeholderLabel={currentSpreadIndex === 0 ? "Inside cover" : undefined}
              onSlotSelect={onSlotSelect}
              onSlotReplace={onSlotReplace}
              onSlotToggleOwned={onSlotToggleOwned}
              onSlotClear={onSlotClear}
            />

            <div
              aria-hidden
              className="w-1 shrink-0 self-stretch rounded-full bg-gradient-to-b from-zinc-700 via-zinc-600 to-zinc-700 shadow-[0_0_12px_rgba(0,0,0,0.35)]"
            />

            <SpreadSide
              side="right"
              pageNumber={rightPage}
              slots={rightSlots}
              layout={layout}
              cardSize={cardSize}
              onSlotSelect={onSlotSelect}
              onSlotReplace={onSlotReplace}
              onSlotToggleOwned={onSlotToggleOwned}
              onSlotClear={onSlotClear}
            />
          </div>
        ) : (
          <BinderGrid
            layout={layout}
            slots={slots}
            cardSize={cardSize}
            onSlotSelect={onSlotSelect}
            onSlotReplace={onSlotReplace}
            onSlotToggleOwned={onSlotToggleOwned}
            onSlotClear={onSlotClear}
          />
        )}
      </div>

      <PageArrow direction="next" disabled={!canGoNext} onClick={handleNext} />
    </div>
  );
}

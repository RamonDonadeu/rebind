"use client";

import type { ReactNode } from "react";
import type { PageViewMode } from "@/lib/binder-view";
import { buildBinderSpreads } from "@/lib/binder-view";

type PageNavigatorProps = {
  viewMode: PageViewMode;
  totalPages: number;
  currentPage: number;
  currentSpreadIndex: number;
  onPageChange: (page: number) => void;
  onSpreadChange: (spreadIndex: number) => void;
};

const WINDOW_SIZE = 5;

function getVisibleIndices(current: number, total: number): number[] {
  const half = Math.floor(WINDOW_SIZE / 2);
  let start = Math.max(0, current - half);
  let end = Math.min(total - 1, start + WINDOW_SIZE - 1);
  start = Math.max(0, end - WINDOW_SIZE + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      className="shrink-0 rounded-md border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-xs text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

const FOOTER_CLASS =
  "fixed inset-x-0 bottom-0 z-20 border-t border-zinc-800 bg-zinc-950 py-2 shadow-[0_-8px_24px_rgba(0,0,0,0.45)]";

function FooterBar({ children }: { children: ReactNode }) {
  return (
    <footer className={FOOTER_CLASS}>
      <div className="flex justify-center px-3 sm:px-6">
        <div className="inline-flex max-w-full items-center gap-1 leading-none">{children}</div>
      </div>
    </footer>
  );
}

function PageStrip({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-1 px-1">{children}</div>;
}

const pageButtonClass = (active: boolean) =>
  `min-w-7 shrink-0 rounded-md px-2 py-0.5 text-xs font-medium transition ${
    active
      ? "bg-brand-600 text-white shadow-sm"
      : "border border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
  }`;

export function PageNavigator({
  viewMode,
  totalPages,
  currentPage,
  currentSpreadIndex,
  onPageChange,
  onSpreadChange,
}: PageNavigatorProps) {
  if (viewMode === "spread") {
    const spreads = buildBinderSpreads(totalPages);
    const visibleIndices = getVisibleIndices(currentSpreadIndex, spreads.length);

    return (
      <FooterBar>
        <NavButton
          label="First spread"
          disabled={currentSpreadIndex <= 0}
          onClick={() => onSpreadChange(0)}
        >
          «
        </NavButton>

        <NavButton
          label="Previous spread"
          disabled={currentSpreadIndex <= 0}
          onClick={() => onSpreadChange(currentSpreadIndex - 1)}
        >
          ‹
        </NavButton>

        <PageStrip>
          {visibleIndices.map((index) => {
            const spread = spreads[index];
            if (!spread) {
              return null;
            }

            const active = index === currentSpreadIndex;

            return (
              <button
                key={spread.index}
                type="button"
                onClick={() => onSpreadChange(index)}
                aria-label={`Pages ${spread.label}`}
                aria-current={active ? "page" : undefined}
                className={pageButtonClass(active)}
              >
                {spread.label}
              </button>
            );
          })}
        </PageStrip>

        <NavButton
          label="Next spread"
          disabled={currentSpreadIndex >= spreads.length - 1}
          onClick={() => onSpreadChange(currentSpreadIndex + 1)}
        >
          ›
        </NavButton>

        <NavButton
          label="Last spread"
          disabled={currentSpreadIndex >= spreads.length - 1}
          onClick={() => onSpreadChange(spreads.length - 1)}
        >
          »
        </NavButton>
      </FooterBar>
    );
  }

  const visiblePages = getVisibleIndices(currentPage - 1, totalPages).map((index) => index + 1);

  return (
    <FooterBar>
      <NavButton
        label="First page"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(1)}
      >
        «
      </NavButton>

      <NavButton
        label="Previous page"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ‹
      </NavButton>

      <PageStrip>
        {visiblePages.map((page) => {
          const active = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={active ? "page" : undefined}
              className={pageButtonClass(active)}
            >
              {page}
            </button>
          );
        })}
      </PageStrip>

      <NavButton
        label="Next page"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        ›
      </NavButton>

      <NavButton
        label="Last page"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(totalPages)}
      >
        »
      </NavButton>
    </FooterBar>
  );
}

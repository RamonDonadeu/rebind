"use client";

type PageNavigatorProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const WINDOW_SIZE = 5;

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const half = Math.floor(WINDOW_SIZE / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + WINDOW_SIZE - 1);
  start = Math.max(1, end - WINDOW_SIZE + 1);

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
      className="rounded-md border border-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200 disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function PageNavigator({ currentPage, totalPages, onPageChange }: PageNavigatorProps) {
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <footer className="sticky bottom-0 z-10 -mx-6 shrink-0 border-t border-zinc-800/80 bg-[var(--background)]/95 px-6 py-1.5 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-1 leading-none">
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

        {visiblePages.map((page) => {
          const active = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={active ? "page" : undefined}
              className={`min-w-7 rounded-md px-1.5 py-0.5 text-xs font-medium transition ${
                active
                  ? "bg-brand-600 text-white"
                  : "border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              {page}
            </button>
          );
        })}

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
      </div>
    </footer>
  );
}

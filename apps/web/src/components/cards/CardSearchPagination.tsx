"use client";

type CardSearchPaginationProps = {
  page: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
};

export function CardSearchPagination({ page, hasMore, onPageChange }: CardSearchPaginationProps) {
  const canGoBack = page > 1;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-1 pt-3">
      <button
        type="button"
        disabled={!canGoBack}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:pointer-events-none disabled:opacity-40"
      >
        Previous
      </button>

      <span className="text-sm text-zinc-500">Page {page}</span>

      <button
        type="button"
        disabled={!hasMore}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:pointer-events-none disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

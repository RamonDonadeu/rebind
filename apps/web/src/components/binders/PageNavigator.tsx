"use client";

type PageNavigatorProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function PageNavigator({ currentPage, totalPages, onPageChange }: PageNavigatorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 disabled:opacity-40 hover:border-zinc-500"
        >
          Previous
        </button>
        <p className="text-sm text-zinc-400">
          Page <span className="font-medium text-zinc-200">{currentPage}</span> of {totalPages}
        </p>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 disabled:opacity-40 hover:border-zinc-500"
        >
          Next
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;
          const active = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-9 shrink-0 rounded-md px-2 py-1 text-xs font-medium transition ${
                active
                  ? "bg-brand-600 text-white"
                  : "border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>
    </div>
  );
}

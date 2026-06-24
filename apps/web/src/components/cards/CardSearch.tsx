"use client";

import { useEffect } from "react";
import { canSearch } from "@/lib/cards";
import type { SearchCard } from "@/lib/cards";
import { useCardSearch } from "@/hooks/useCardSearch";
import { CardSearchFilters } from "./CardSearchFilters";
import { CardSearchPagination } from "./CardSearchPagination";
import { CardSearchResults } from "./CardSearchResults";

export type CardSearchVariant = "compact" | "expanded";

type CardSearchProps = {
  variant?: CardSearchVariant;
  enabled?: boolean;
  title?: string;
  onSelect: (card: SearchCard) => void;
  onClose?: () => void;
};

export function CardSearch({
  variant = "expanded",
  enabled = true,
  title = "Search cards",
  onSelect,
  onClose,
}: CardSearchProps) {
  const {
    filters,
    debouncedQuery,
    results,
    pagination,
    sets,
    loading,
    setsLoading,
    error,
    sortOptions,
    reset,
    updateQuery,
    updateSetId,
    updateRarity,
    updateSort,
    updateOrder,
    goToPage,
  } = useCardSearch({ enabled });

  useEffect(() => {
    if (!enabled) {
      reset();
    }
  }, [enabled, reset]);

  const searchable = canSearch({
    query: debouncedQuery,
    setId: filters.setId,
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-3 border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-zinc-400 transition hover:text-zinc-200"
            >
              Close
            </button>
          )}
        </div>

        <CardSearchFilters
          variant={variant}
          query={filters.query}
          setId={filters.setId}
          rarity={filters.rarity}
          sort={filters.sort}
          order={filters.order}
          sets={sets}
          setsLoading={setsLoading}
          sortOptions={sortOptions}
          onQueryChange={updateQuery}
          onSetIdChange={updateSetId}
          onRarityChange={updateRarity}
          onSortChange={updateSort}
          onOrderChange={updateOrder}
        />

        {variant === "expanded" && filters.sort === "price" && (
          <p className="text-xs text-zinc-500">
            Price sorting uses TCGdex market data. Prices are not shown in results yet.
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <CardSearchResults
          variant={variant}
          results={results}
          loading={loading}
          error={error}
          canSearch={searchable}
          onSelect={onSelect}
        />
      </div>

      {searchable && !loading && results.length > 0 && (
        <div className="shrink-0 p-4 pt-0">
          <CardSearchPagination
            page={pagination.page}
            hasMore={pagination.hasMore}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  );
}

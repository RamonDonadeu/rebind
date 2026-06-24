"use client";

import { CARD_SEARCH_RARITIES } from "@rebind/shared";
import type { CardSetOption } from "@/lib/cards";
import type { CardSearchSortField } from "@rebind/shared";

type CardSearchFiltersProps = {
  variant: "compact" | "expanded";
  query: string;
  setId: string;
  rarity: string;
  sort: CardSearchSortField;
  order: "asc" | "desc";
  sets: CardSetOption[];
  setsLoading: boolean;
  sortOptions: ReadonlyArray<{ value: CardSearchSortField; label: string }>;
  onQueryChange: (value: string) => void;
  onSetIdChange: (value: string) => void;
  onRarityChange: (value: string) => void;
  onSortChange: (value: CardSearchSortField) => void;
  onOrderChange: (value: "asc" | "desc") => void;
};

const selectClassName =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

export function CardSearchFilters({
  variant,
  query,
  setId,
  rarity,
  sort,
  order,
  sets,
  setsLoading,
  sortOptions,
  onQueryChange,
  onSetIdChange,
  onRarityChange,
  onSortChange,
  onOrderChange,
}: CardSearchFiltersProps) {
  const showAdvanced = variant === "expanded";

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search by name (e.g. Charizard)"
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />

      {showAdvanced && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Set</span>
            <select
              value={setId}
              onChange={(event) => onSetIdChange(event.target.value)}
              disabled={setsLoading}
              className={selectClassName}
            >
              <option value="">All sets</option>
              {sets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Rarity</span>
            <select
              value={rarity}
              onChange={(event) => onRarityChange(event.target.value)}
              className={selectClassName}
            >
              <option value="">All rarities</option>
              {CARD_SEARCH_RARITIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Sort by</span>
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value as CardSearchSortField)}
              className={selectClassName}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Order</span>
            <select
              value={order}
              onChange={(event) => onOrderChange(event.target.value as "asc" | "desc")}
              className={selectClassName}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}

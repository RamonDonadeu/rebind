"use client";

import { useEffect, useState } from "react";
import { CARD_SEARCH_RARITIES } from "@rebind/shared";
import type { CardSetOption } from "@/lib/cards";
import { hasAdvancedFilters } from "@/lib/cards";
import type { CardSearchSortField } from "@rebind/shared";

type CardSearchFiltersProps = {
  variant: "compact" | "expanded";
  panelOpen?: boolean;
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

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

function AdvancedFilters({
  setId,
  rarity,
  sort,
  order,
  sets,
  setsLoading,
  sortOptions,
  onSetIdChange,
  onRarityChange,
  onSortChange,
  onOrderChange,
}: Omit<CardSearchFiltersProps, "variant" | "query" | "onQueryChange">) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
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
  );
}

export function CardSearchFilters({
  variant,
  panelOpen = true,
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const collapsible = variant === "compact";
  const advancedActive = hasAdvancedFilters({ query, setId, rarity, sort, order, page: 1 });

  useEffect(() => {
    if (!panelOpen) {
      setFiltersOpen(false);
    }
  }, [panelOpen]);

  const advancedProps = {
    setId,
    rarity,
    sort,
    order,
    sets,
    setsLoading,
    sortOptions,
    onSetIdChange,
    onRarityChange,
    onSortChange,
    onOrderChange,
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search by name (e.g. Charizard)"
        className="w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />

      {collapsible && (
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
            filtersOpen || advancedActive
              ? "border-brand-600/50 bg-brand-600/10 text-zinc-100"
              : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500"
          }`}
        >
          <FilterIcon />
          Filters
          {advancedActive && (
            <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-medium leading-none text-white">
              On
            </span>
          )}
        </button>
      )}

      {collapsible && filtersOpen && <AdvancedFilters {...advancedProps} />}

      {!collapsible && <AdvancedFilters {...advancedProps} />}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  buildSearchParams,
  canSearch,
  type CardSearchFilters,
  type CardSetOption,
  type SearchCard,
  type SearchPagination,
} from "@/lib/cards";
import { CARD_SEARCH_SORT_OPTIONS, type CardSearchSortField } from "@rebind/shared";

const DEFAULT_FILTERS: CardSearchFilters = {
  query: "",
  setId: "",
  rarity: "",
  sort: "releaseDate",
  order: "asc",
  page: 1,
};

type UseCardSearchOptions = {
  enabled?: boolean;
  debounceMs?: number;
};

export function useCardSearch({ enabled = true, debounceMs = 300 }: UseCardSearchOptions = {}) {
  const [filters, setFilters] = useState<CardSearchFilters>(DEFAULT_FILTERS);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchCard[]>([]);
  const [pagination, setPagination] = useState<SearchPagination>({
    page: 1,
    limit: 24,
    hasMore: false,
  });
  const [sets, setSets] = useState<CardSetOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [setsLoading, setSetsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setDebouncedQuery("");
    setResults([]);
    setPagination({ page: 1, limit: 24, hasMore: false });
    setError(null);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(filters.query.trim()), debounceMs);
    return () => window.clearTimeout(timer);
  }, [filters.query, debounceMs]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function loadSets() {
      setSetsLoading(true);

      try {
        const response = await apiClient.get<{ data: CardSetOption[] }>("/cards/sets");
        if (!cancelled) {
          setSets(response.data);
        }
      } catch {
        if (!cancelled) {
          setSets([]);
        }
      } finally {
        if (!cancelled) {
          setSetsLoading(false);
        }
      }
    }

    void loadSets();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const activeFilters: CardSearchFilters = {
      ...filters,
      query: debouncedQuery,
    };

    if (!canSearch(activeFilters)) {
      setResults([]);
      setPagination({ page: 1, limit: 24, hasMore: false });
      return;
    }

    let cancelled = false;

    async function search() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiClient.get<{
          data: SearchCard[];
          pagination: SearchPagination;
        }>(`/cards/search?${buildSearchParams(activeFilters)}`);

        if (!cancelled) {
          setResults(data.data);
          setPagination(data.pagination);
        }
      } catch {
        if (!cancelled) {
          setError("Search failed. Try again.");
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void search();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, filters.setId, filters.rarity, filters.sort, filters.order, filters.page, enabled]);

  function updateQuery(query: string) {
    setFilters((current) => ({ ...current, query, page: 1 }));
  }

  function updateSetId(setId: string) {
    setFilters((current) => ({ ...current, setId, page: 1 }));
  }

  function updateRarity(rarity: string) {
    setFilters((current) => ({ ...current, rarity, page: 1 }));
  }

  function updateSort(sort: CardSearchSortField) {
    setFilters((current) => ({ ...current, sort, page: 1 }));
  }

  function updateOrder(order: "asc" | "desc") {
    setFilters((current) => ({ ...current, order, page: 1 }));
  }

  function goToPage(page: number) {
    setFilters((current) => ({ ...current, page: Math.max(1, page) }));
  }

  return {
    filters,
    debouncedQuery,
    results,
    pagination,
    sets,
    loading,
    setsLoading,
    error,
    sortOptions: CARD_SEARCH_SORT_OPTIONS,
    reset,
    updateQuery,
    updateSetId,
    updateRarity,
    updateSort,
    updateOrder,
    goToPage,
  };
}

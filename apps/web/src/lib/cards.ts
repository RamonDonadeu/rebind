import type { CardSearchSortField } from "@rebind/shared";

export type SearchCard = {
  externalId: string;
  name: string;
  imageUrl: string | null;
  setId: string;
  localId: string;
};

export type SearchPagination = {
  page: number;
  limit: number;
  hasMore: boolean;
};

export type SearchResponse = {
  data: SearchCard[];
  pagination: SearchPagination;
};

export type CardSetOption = {
  id: string;
  name: string;
};

export type SetsResponse = {
  data: CardSetOption[];
};

export type CardSearchFilters = {
  query: string;
  setId: string;
  rarity: string;
  sort: CardSearchSortField;
  order: "asc" | "desc";
  page: number;
};

export function buildSearchParams(filters: CardSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.query.trim().length >= 2) {
    params.set("q", filters.query.trim());
  }

  if (filters.setId) {
    params.set("set", filters.setId);
  }

  if (filters.rarity) {
    params.set("rarity", filters.rarity);
  }

  params.set("sort", filters.sort);
  params.set("order", filters.order);
  params.set("page", String(filters.page));
  params.set("limit", "24");

  return params.toString();
}

export function canSearch(filters: Pick<CardSearchFilters, "query" | "setId">): boolean {
  return filters.query.trim().length >= 2 || filters.setId.length > 0;
}

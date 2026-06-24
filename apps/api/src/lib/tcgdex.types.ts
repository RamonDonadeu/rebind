export type TcgdexSearchCard = {
  id: string;
  localId: string;
  name: string;
  image?: string;
};

export type TcgdexCardDetail = {
  id: string;
  localId: string;
  name: string;
  image?: string;
  rarity?: string;
  set?: {
    id: string;
    name?: string;
  };
  pricing?: Record<string, unknown> | null;
};

export type NormalizedSearchCard = {
  externalId: string;
  name: string;
  imageUrl: string | null;
  setId: string;
  localId: string;
};

export type NormalizedSearchResponse = {
  data: NormalizedSearchCard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

export type NormalizedCardDetail = {
  externalId: string;
  name: string;
  imageUrl: string | null;
  setId: string;
  localId: string;
  rarity: string | null;
  pricing: Record<string, unknown> | null;
};

export function extractSetId(externalId: string): string {
  const dashIndex = externalId.lastIndexOf("-");
  return dashIndex > 0 ? externalId.slice(0, dashIndex) : externalId;
}

export function normalizeImageUrl(image?: string): string | null {
  if (!image) {
    return null;
  }

  if (/\.(webp|png|jpe?g)$/i.test(image)) {
    return image;
  }

  return `${image}/high.webp`;
}

export function normalizeSearchCard(card: TcgdexSearchCard): NormalizedSearchCard {
  return {
    externalId: card.id,
    name: card.name,
    imageUrl: normalizeImageUrl(card.image),
    setId: extractSetId(card.id),
    localId: card.localId,
  };
}

export function normalizeCardDetail(card: TcgdexCardDetail): NormalizedCardDetail {
  return {
    externalId: card.id,
    name: card.name,
    imageUrl: normalizeImageUrl(card.image),
    setId: card.set?.id ?? extractSetId(card.id),
    localId: card.localId,
    rarity: card.rarity ?? null,
    pricing: card.pricing ?? null,
  };
}

export function paginateSearchResults(
  cards: NormalizedSearchCard[],
  page: number,
  limit: number
): NormalizedSearchResponse {
  const total = cards.length;
  const start = (page - 1) * limit;

  return {
    data: cards.slice(start, start + limit),
    pagination: { page, limit, total },
  };
}

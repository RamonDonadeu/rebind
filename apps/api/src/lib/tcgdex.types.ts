import {
  CARD_VARIANT_ORDER,
  type CardVariant,
} from "@rebind/shared";

export type TcgdexSetBrief = {
  id: string;
  name: string;
};

export type NormalizedSetBrief = {
  id: string;
  name: string;
};

export type TcgdexVariants = {
  normal?: boolean;
  reverse?: boolean;
  holo?: boolean;
  firstEdition?: boolean;
  wPromo?: boolean;
};

export type TcgdexCardmarketPricing = {
  unit?: string;
  avg?: number | null;
  low?: number | null;
  trend?: number | null;
  "avg-holo"?: number | null;
  "low-holo"?: number | null;
  "trend-holo"?: number | null;
};

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
  variants?: TcgdexVariants;
  set?: {
    id: string;
    name?: string;
  };
  pricing?: {
    cardmarket?: TcgdexCardmarketPricing;
    tcgplayer?: Record<string, unknown>;
  } | null;
};

export type NormalizedSearchCard = {
  externalId: string;
  name: string;
  imageUrl: string | null;
  setId: string;
  setName: string | null;
  localId: string;
  variant: CardVariant;
  marketPrice: number | null;
  marketPriceCurrency: string | null;
};

export type SearchCardEnrichment = {
  variants: CardVariant[];
  setName: string | null;
  pricing: TcgdexCardDetail["pricing"];
};

export function availableVariantsFromTcgdex(variants?: TcgdexVariants | null): CardVariant[] {
  if (!variants) {
    return ["normal"];
  }

  const available = CARD_VARIANT_ORDER.filter((variant) => variants[variant]);

  return available.length > 0 ? available : ["normal"];
}

function cardmarketNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function firstCardmarketPrice(
  cardmarket: TcgdexCardmarketPricing,
  keys: string[]
): number | null {
  for (const key of keys) {
    const value = cardmarketNumber(cardmarket[key as keyof TcgdexCardmarketPricing]);
    if (value !== null) {
      return value;
    }
  }

  return null;
}

export function extractCardmarketPrice(
  pricing: TcgdexCardDetail["pricing"],
  variant: CardVariant,
  availableVariants: CardVariant[]
): { price: number | null; currency: string | null } {
  const cardmarket = pricing?.cardmarket;
  if (!cardmarket) {
    return { price: null, currency: null };
  }

  const currency = cardmarket.unit ?? "EUR";

  if (variant === "normal") {
    return {
      price: firstCardmarketPrice(cardmarket, ["trend", "avg", "low"]),
      currency,
    };
  }

  const holoOnly =
    availableVariants.length === 1 && availableVariants[0] === "holo";

  if (holoOnly) {
    return {
      price: firstCardmarketPrice(cardmarket, [
        "trend",
        "avg",
        "low",
        "trend-holo",
        "avg-holo",
        "low-holo",
      ]),
      currency,
    };
  }

  return {
    price: firstCardmarketPrice(cardmarket, [
      "trend-holo",
      "avg-holo",
      "low-holo",
      "trend",
      "avg",
      "low",
    ]),
    currency,
  };
}

export function expandSearchCardsWithVariants(
  cards: Omit<
    NormalizedSearchCard,
    "variant" | "setName" | "marketPrice" | "marketPriceCurrency"
  >[],
  enrichmentByCardId: Map<string, SearchCardEnrichment>
): NormalizedSearchCard[] {
  const expanded: NormalizedSearchCard[] = [];

  for (const card of cards) {
    const enrichment = enrichmentByCardId.get(card.externalId) ?? {
      variants: ["normal" as const],
      setName: null,
      pricing: null,
    };
    const variants = enrichment.variants;
    const setName = enrichment.setName;

    for (const variant of variants) {
      const { price, currency } = extractCardmarketPrice(
        enrichment.pricing,
        variant,
        variants
      );

      expanded.push({
        ...card,
        variant,
        setName,
        marketPrice: price,
        marketPriceCurrency: currency,
      });
    }
  }

  return expanded;
}

export type NormalizedSearchResponse = {
  data: NormalizedSearchCard[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
};

export type NormalizedCardDetail = {
  externalId: string;
  name: string;
  imageUrl: string | null;
  setId: string;
  setName: string | null;
  localId: string;
  rarity: string | null;
  variants: CardVariant[];
  pricing: TcgdexCardDetail["pricing"];
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

export function normalizeSearchCard(
  card: TcgdexSearchCard
): Omit<
  NormalizedSearchCard,
  "variant" | "setName" | "marketPrice" | "marketPriceCurrency"
> {
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
    setName: card.set?.name ?? null,
    localId: card.localId,
    rarity: card.rarity ?? null,
    variants: availableVariantsFromTcgdex(card.variants),
    pricing: card.pricing ?? null,
  };
}

export function normalizeSetBrief(set: TcgdexSetBrief): NormalizedSetBrief {
  return {
    id: set.id,
    name: set.name,
  };
}

export function sortSearchResultsByPrice(
  cards: NormalizedSearchCard[],
  order: "asc" | "desc"
): NormalizedSearchCard[] {
  const direction = order === "desc" ? -1 : 1;

  return [...cards].sort((left, right) => {
    const leftPrice = left.marketPrice;
    const rightPrice = right.marketPrice;

    if (leftPrice === null && rightPrice === null) {
      return left.name.localeCompare(right.name);
    }

    if (leftPrice === null) {
      return 1;
    }

    if (rightPrice === null) {
      return -1;
    }

    if (leftPrice === rightPrice) {
      return left.name.localeCompare(right.name);
    }

    return (leftPrice - rightPrice) * direction;
  });
}

export function buildSearchResponse(
  cards: NormalizedSearchCard[],
  page: number,
  limit: number,
  hasMore?: boolean
): NormalizedSearchResponse {
  return {
    data: cards,
    pagination: {
      page,
      limit,
      hasMore: hasMore ?? cards.length >= limit,
    },
  };
}

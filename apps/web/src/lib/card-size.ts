export const CARD_SIZE_LEVELS = [1, 2, 3, 4, 5] as const;

export type CardSizeLevel = (typeof CARD_SIZE_LEVELS)[number];

export const DEFAULT_CARD_SIZE: CardSizeLevel = 3;

/** Max grid width in single-page view */
export const CARD_SIZE_MAX_WIDTH: Record<CardSizeLevel, string> = {
  1: "max-w-[min(100%,20rem)]",
  2: "max-w-[min(100%,28rem)]",
  3: "max-w-[min(100%,36rem)]",
  4: "max-w-[min(100%,48rem)]",
  5: "max-w-full",
};

/** Page panel width within each spread column (percent of column, not viewport) */
export const CARD_SIZE_SPREAD_WIDTH: Record<CardSizeLevel, string> = {
  1: "w-[45%]",
  2: "w-[60%]",
  3: "w-[75%]",
  4: "w-[90%]",
  5: "w-full",
};

export function gridMaxWidthClass(cardSize: CardSizeLevel): string {
  return CARD_SIZE_MAX_WIDTH[cardSize];
}

export function spreadPageWidthClass(cardSize: CardSizeLevel): string {
  return CARD_SIZE_SPREAD_WIDTH[cardSize];
}

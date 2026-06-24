export const CARD_SIZE_LEVELS = [1, 2, 3, 4, 5] as const;

export type CardSizeLevel = (typeof CARD_SIZE_LEVELS)[number];

export const DEFAULT_CARD_SIZE: CardSizeLevel = 3;

export const CARD_SIZE_MAX_WIDTH: Record<CardSizeLevel, string> = {
  1: "max-w-[260px]",
  2: "max-w-[340px]",
  3: "max-w-[440px]",
  4: "max-w-[560px]",
  5: "max-w-full",
};

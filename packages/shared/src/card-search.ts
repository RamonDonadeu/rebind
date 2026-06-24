export const CARD_SEARCH_SORT_OPTIONS = [
  { value: "releaseDate", label: "Set release" },
  { value: "name", label: "Name" },
  { value: "rarity", label: "Rarity" },
  { value: "price", label: "Price" },
] as const;

export type CardSearchSortField = (typeof CARD_SEARCH_SORT_OPTIONS)[number]["value"];

export const CARD_SEARCH_RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Rare Holo",
  "Rare Holo EX",
  "Rare Holo GX",
  "Rare Holo V",
  "Rare Holo VMAX",
  "Rare Holo VSTAR",
  "Rare Prime",
  "Rare Prism Star",
  "Rare Rainbow",
  "Rare Secret",
  "Rare Shining",
  "Rare Ultra",
  "Illustration Rare",
  "Special Illustration Rare",
  "Hyper Rare",
  "Double Rare",
  "Promo",
] as const;

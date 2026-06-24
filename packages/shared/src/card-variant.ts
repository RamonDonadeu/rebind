import type { CardVariant } from "./plans";

export const CARD_VARIANT_ORDER: CardVariant[] = ["normal", "holo", "reverse"];

export function cardVariantLabel(variant: CardVariant): string {
  switch (variant) {
    case "reverse":
      return "Reverse Holo";
    case "holo":
      return "Holo";
    default:
      return "Normal";
  }
}

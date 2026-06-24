import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ReBind — Digital Pokémon TCG Binder App",
  description:
    "Organize your Pokémon TCG collection in digital binders. Search cards via TCGdex, arrange them page by page in 3×3 or 3×4 grids, and keep your binders intact across sessions.",
  keywords: [
    "Pokémon TCG",
    "digital binder",
    "card collection",
    "TCGdex",
    "Pokémon cards organizer",
    "trading card binder",
  ],
  openGraph: {
    title: "ReBind — Digital Pokémon TCG Binders",
    description:
      "Build digital Pokémon TCG binders page by page. Search cards, place them in slots, and organize your collection.",
    type: "website",
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return children;
}

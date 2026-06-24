"use client";

import { cardVariantLabel } from "@rebind/shared";
import { formatMarketPrice, type SearchCard } from "@/lib/cards";

type CardSearchResultsProps = {
  variant: "compact" | "expanded";
  results: SearchCard[];
  loading: boolean;
  error: string | null;
  canSearch: boolean;
  onSelect: (card: SearchCard) => void;
};

function SearchCardMeta({ card }: { card: SearchCard }) {
  const setLabel = card.setName ?? card.setId;
  const priceLabel = formatMarketPrice(card.marketPrice, card.marketPriceCurrency);
  const variantLabel =
    card.variant !== "normal" ? cardVariantLabel(card.variant) : null;

  return (
    <>
      <p className="truncate text-xs text-zinc-500">
        {setLabel}
        {variantLabel ? ` · ${variantLabel}` : ""}
      </p>
      {priceLabel ? (
        <p className="text-xs font-medium text-emerald-400">{priceLabel}</p>
      ) : null}
    </>
  );
}

export function CardSearchResults({
  variant,
  results,
  loading,
  error,
  canSearch,
  onSelect,
}: CardSearchResultsProps) {
  if (!canSearch) {
    return (
      <p className="px-2 py-4 text-sm text-zinc-500">
        Type at least 2 characters or choose a set to browse cards.
      </p>
    );
  }

  if (loading) {
    return <p className="px-2 py-4 text-sm text-zinc-500">Searching…</p>;
  }

  if (error) {
    return <p className="px-2 py-4 text-sm text-red-300">{error}</p>;
  }

  if (results.length === 0) {
    return <p className="px-2 py-4 text-sm text-zinc-500">No cards found.</p>;
  }

  if (variant === "expanded") {
    return (
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {results.map((card) => (
          <li key={`${card.externalId}-${card.variant}`}>
            <button
              type="button"
              onClick={() => onSelect(card)}
              className="flex w-full flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-left transition hover:border-zinc-600 hover:bg-zinc-900"
            >
              <div className="flex aspect-[2.5/3.5] items-center justify-center bg-zinc-900/50 p-2">
                {card.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.imageUrl}
                    alt=""
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-zinc-500">No image</span>
                )}
              </div>
              <div className="space-y-0.5 p-2">
                <p className="line-clamp-2 text-sm font-medium text-zinc-100">{card.name}</p>
                <SearchCardMeta card={card} />
              </div>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-1">
      {results.map((card) => {
        const priceLabel = formatMarketPrice(card.marketPrice, card.marketPriceCurrency);

        return (
          <li key={`${card.externalId}-${card.variant}`}>
            <button
              type="button"
              onClick={() => onSelect(card)}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-zinc-800"
            >
              {card.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-14 w-10 shrink-0 rounded object-contain"
                />
              ) : (
                <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded bg-zinc-800 text-xs text-zinc-500">
                  ?
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-100">{card.name}</p>
                <SearchCardMeta card={card} />
              </div>
              {priceLabel ? (
                <span className="shrink-0 text-xs font-medium text-emerald-400">{priceLabel}</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

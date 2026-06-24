"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { SearchCard, SearchResponse } from "@/lib/binders";

type CardSearchModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (card: SearchCard) => void;
};

export function CardSearchModal({ open, onClose, onSelect }: CardSearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
      setResults([]);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;

    async function search() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiClient.get<SearchResponse>(
          `/cards/search?q=${encodeURIComponent(debouncedQuery)}&limit=20`
        );

        if (!cancelled) {
          setResults(data.data);
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
  }, [debouncedQuery, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-[10vh]">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
        <div className="border-b border-zinc-800 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-100">Search cards</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-zinc-400 hover:text-zinc-200"
            >
              Close
            </button>
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name (e.g. Charizard)"
            autoFocus
            className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="overflow-y-auto p-2">
          {loading && <p className="px-2 py-4 text-sm text-zinc-500">Searching…</p>}
          {error && <p className="px-2 py-4 text-sm text-red-300">{error}</p>}
          {!loading && debouncedQuery.length >= 2 && results.length === 0 && !error && (
            <p className="px-2 py-4 text-sm text-zinc-500">No cards found.</p>
          )}
          {debouncedQuery.length < 2 && (
            <p className="px-2 py-4 text-sm text-zinc-500">Type at least 2 characters to search.</p>
          )}

          <ul className="space-y-1">
            {results.map((card) => (
              <li key={card.externalId}>
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
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-100">{card.name}</p>
                    <p className="truncate text-xs text-zinc-500">{card.setId}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BinderHeader } from "@/components/binders/BinderHeader";
import { BinderPageView } from "@/components/binders/BinderPageView";
import { CardSearchPanel } from "@/components/cards/CardSearchPanel";
import { PageNavigator } from "@/components/binders/PageNavigator";
import { apiClient, ApiClientError } from "@/lib/api-client";
import type { BinderDetail, BinderSlot, SearchCard } from "@/lib/binders";
import { layoutLabel, slotsForPage } from "@/lib/binders";
import {
  buildBinderSpreads,
  clampSpreadIndex,
  spreadIndexForPage,
  type PageViewMode,
} from "@/lib/binder-view";
import type { CardSizeLevel } from "@/lib/card-size";
import {
  loadBinderPreferences,
  saveBinderPreferences,
} from "@/lib/binder-preferences";

type BinderEditorPageProps = {
  binderId: string;
};

export default function BinderEditorPage({ binderId }: BinderEditorPageProps) {
  const router = useRouter();
  const [binder, setBinder] = useState<BinderDetail | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [activeSlot, setActiveSlot] = useState<BinderSlot | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cardSize, setCardSize] = useState<CardSizeLevel>(
    () => loadBinderPreferences(binderId).cardSize
  );
  const [pageViewMode, setPageViewMode] = useState<PageViewMode>(
    () => loadBinderPreferences(binderId).pageViewMode
  );
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [pageDirection, setPageDirection] = useState<"next" | "prev" | null>(null);

  const spreads = useMemo(
    () => (binder ? buildBinderSpreads(binder.pageCount) : []),
    [binder]
  );

  function handlePageChange(page: number) {
    if (page !== currentPage) {
      setPageDirection(page > currentPage ? "next" : "prev");
    }
    setCurrentPage(page);
    setCurrentSpreadIndex(spreadIndexForPage(page));
  }

  function handleSpreadChange(spreadIndex: number) {
    if (!binder) {
      return;
    }

    const nextIndex = clampSpreadIndex(spreadIndex, binder.pageCount);
    const spread = spreads[nextIndex];

    if (!spread) {
      return;
    }

    if (nextIndex !== currentSpreadIndex) {
      setPageDirection(nextIndex > currentSpreadIndex ? "next" : "prev");
    }

    setCurrentSpreadIndex(nextIndex);
    setCurrentPage(spread.pages[0]);
  }

  function handleCardSizeChange(size: CardSizeLevel) {
    setCardSize(size);
    saveBinderPreferences(binderId, { cardSize: size });
  }

  function handlePageViewModeChange(mode: PageViewMode) {
    if (!binder) {
      return;
    }

    if (mode === "spread") {
      setCurrentSpreadIndex(spreadIndexForPage(currentPage));
    }

    setPageViewMode(mode);
    saveBinderPreferences(binderId, { pageViewMode: mode });
  }

  useEffect(() => {
    const prefs = loadBinderPreferences(binderId);
    setCardSize(prefs.cardSize);
    setPageViewMode(prefs.pageViewMode);
    setCurrentPage(1);
    setCurrentSpreadIndex(0);
  }, [binderId]);

  const loadBinder = useCallback(async () => {
    try {
      const data = await apiClient.get<BinderDetail>(`/binders/${binderId}`);
      setBinder(data);
      setError(null);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to load binder.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [binderId]);

  useEffect(() => {
    void loadBinder();
  }, [loadBinder]);

  function updateSlotInState(updated: BinderSlot) {
    setBinder((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        slots: current.slots.map((slot) =>
          slot.pageIndex === updated.pageIndex &&
          slot.row === updated.row &&
          slot.col === updated.col
            ? updated
            : slot
        ),
      };
    });
  }

  function handleSlotSelect(slot: BinderSlot) {
    setActionError(null);
    setActiveSlot(slot);
    setSearchOpen(true);
  }

  function handleSlotReplace(slot: BinderSlot) {
    setActionError(null);
    setActiveSlot(slot);
    setSearchOpen(true);
  }

  async function placeCard(card: SearchCard) {
    if (!binder || !activeSlot) {
      return;
    }

    if (!card.imageUrl) {
      setActionError("This card has no image available.");
      setSearchOpen(false);
      return;
    }

    const { pageIndex, row, col } = activeSlot;
    const previous = { ...activeSlot };

    const optimistic: BinderSlot = {
      ...activeSlot,
      cardExternalId: card.externalId,
      cardName: card.name,
      imageUrl: card.imageUrl,
      variant: card.variant,
      owned: true,
    };

    updateSlotInState(optimistic);
    setSearchOpen(false);
    setActiveSlot(null);

    try {
      const updated = await apiClient.put<BinderSlot>(
        `/binders/${binder.id}/pages/${pageIndex}/slots/${row}/${col}`,
        {
          cardExternalId: card.externalId,
          cardName: card.name,
          imageUrl: card.imageUrl,
          variant: card.variant,
        }
      );
      updateSlotInState(updated);
    } catch (err) {
      updateSlotInState(previous);
      const message =
        err instanceof ApiClientError ? err.message : "Failed to place card.";
      setActionError(message);
    }
  }

  async function clearSlot(slot: BinderSlot) {
    if (!binder) {
      return;
    }

    const { pageIndex, row, col } = slot;
    const previous = { ...slot };

    const optimistic: BinderSlot = {
      ...slot,
      cardExternalId: null,
      cardName: null,
      imageUrl: null,
      variant: "normal",
      owned: true,
    };

    updateSlotInState(optimistic);

    try {
      const updated = await apiClient.delete<BinderSlot>(
        `/binders/${binder.id}/pages/${pageIndex}/slots/${row}/${col}`
      );
      updateSlotInState(updated);
    } catch (err) {
      updateSlotInState(previous);
      const message =
        err instanceof ApiClientError ? err.message : "Failed to clear slot.";
      setActionError(message);
    }
  }

  async function toggleSlotOwned(slot: BinderSlot) {
    if (!binder || !slot.cardExternalId) {
      return;
    }

    const { pageIndex, row, col } = slot;
    const nextOwned = !slot.owned;
    const previous = { ...slot };

    const optimistic: BinderSlot = { ...slot, owned: nextOwned };
    updateSlotInState(optimistic);

    try {
      const updated = await apiClient.patch<BinderSlot>(
        `/binders/${binder.id}/pages/${pageIndex}/slots/${row}/${col}`,
        { owned: nextOwned }
      );
      updateSlotInState(updated);
    } catch (err) {
      updateSlotInState(previous);
      const message =
        err instanceof ApiClientError ? err.message : "Failed to update ownership.";
      setActionError(message);
    }
  }

  async function handleRename(name: string) {
    if (!binder) {
      return;
    }

    const updated = await apiClient.patch<BinderDetail>(`/binders/${binder.id}`, { name });
    setBinder(updated);
  }

  async function handleDelete() {
    if (!binder) {
      return;
    }

    await apiClient.delete(`/binders/${binder.id}`);
    router.push("/binders");
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading binder…</p>;
  }

  if (error || !binder) {
    return (
      <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
        {error ?? "Binder not found."}
      </p>
    );
  }

  const pageIndex = currentPage - 1;
  const pageSlots = slotsForPage(binder, pageIndex);
  const currentSpread = spreads[currentSpreadIndex];
  const spreadLeftPage = currentSpread?.leftPage ?? null;
  const spreadRightPage = currentSpread?.rightPage ?? null;
  const spreadLeftSlots = spreadLeftPage ? slotsForPage(binder, spreadLeftPage - 1) : undefined;
  const spreadRightSlots = spreadRightPage ? slotsForPage(binder, spreadRightPage - 1) : undefined;

  return (
    <div className="-mx-6 -mb-8 flex w-full min-h-0 flex-1 flex-col gap-6 px-6 pb-14">
      <BinderHeader
        name={binder.name}
        layoutLabel={layoutLabel(binder.layout)}
        pageCount={binder.pageCount}
        cardSize={cardSize}
        onCardSizeChange={handleCardSizeChange}
        pageViewMode={pageViewMode}
        onPageViewModeChange={handlePageViewModeChange}
        onRename={handleRename}
        onDelete={handleDelete}
      />

      {actionError && (
        <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {actionError}
        </p>
      )}

      <div className="w-full min-w-0 flex-1 py-2">
        <BinderPageView
          layout={binder.layout}
          viewMode={pageViewMode}
          slots={pageSlots}
          leftSlots={spreadLeftSlots}
          rightSlots={spreadRightSlots}
          leftPage={spreadLeftPage}
          rightPage={spreadRightPage}
          currentPage={currentPage}
          currentSpreadIndex={currentSpreadIndex}
          totalPages={binder.pageCount}
          totalSpreads={spreads.length}
          cardSize={cardSize}
          pageDirection={pageDirection}
          onPageChange={handlePageChange}
          onSpreadChange={handleSpreadChange}
          onSlotSelect={handleSlotSelect}
          onSlotReplace={handleSlotReplace}
          onSlotToggleOwned={(slot) => void toggleSlotOwned(slot)}
          onSlotClear={(slot) => void clearSlot(slot)}
        />
      </div>

      <PageNavigator
        viewMode={pageViewMode}
        totalPages={binder.pageCount}
        currentPage={currentPage}
        currentSpreadIndex={currentSpreadIndex}
        onPageChange={handlePageChange}
        onSpreadChange={handleSpreadChange}
      />

      <CardSearchPanel
        open={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setActiveSlot(null);
        }}
        onSelect={(card) => void placeCard(card)}
      />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BinderHeader } from "@/components/binders/BinderHeader";
import { BinderPageView } from "@/components/binders/BinderPageView";
import { CardSearchPanel } from "@/components/cards/CardSearchPanel";
import { PageNavigator } from "@/components/binders/PageNavigator";
import { apiClient, ApiClientError } from "@/lib/api-client";
import type { BinderDetail, BinderSlot, SearchCard } from "@/lib/binders";
import { layoutLabel, slotsForPage } from "@/lib/binders";
import { DEFAULT_CARD_SIZE, type CardSizeLevel } from "@/lib/card-size";

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
  const [cardSize, setCardSize] = useState<CardSizeLevel>(DEFAULT_CARD_SIZE);
  const [pageDirection, setPageDirection] = useState<"next" | "prev" | null>(null);

  function handlePageChange(page: number) {
    if (page !== currentPage) {
      setPageDirection(page > currentPage ? "next" : "prev");
    }
    setCurrentPage(page);
  }

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
      variant: "normal",
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
          variant: "normal",
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

  return (
    <div className="-mb-8 flex min-h-[calc(100vh-10rem)] flex-col gap-6">
      <BinderHeader
        name={binder.name}
        layoutLabel={layoutLabel(binder.layout)}
        pageCount={binder.pageCount}
        cardSize={cardSize}
        onCardSizeChange={setCardSize}
        onRename={handleRename}
        onDelete={handleDelete}
      />

      {actionError && (
        <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {actionError}
        </p>
      )}

      <div className="flex flex-1 items-center py-2">
        <BinderPageView
          layout={binder.layout}
          slots={pageSlots}
          currentPage={currentPage}
          totalPages={binder.pageCount}
          cardSize={cardSize}
          pageDirection={pageDirection}
          onPageChange={handlePageChange}
          onSlotSelect={handleSlotSelect}
          onSlotReplace={handleSlotReplace}
          onSlotToggleOwned={(slot) => void toggleSlotOwned(slot)}
          onSlotClear={(slot) => void clearSlot(slot)}
        />
      </div>

      <PageNavigator
        currentPage={currentPage}
        totalPages={binder.pageCount}
        onPageChange={handlePageChange}
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

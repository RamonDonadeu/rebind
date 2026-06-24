"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BinderGrid } from "@/components/binders/BinderGrid";
import { BinderHeader } from "@/components/binders/BinderHeader";
import { CardSearchModal } from "@/components/binders/CardSearchModal";
import { PageNavigator } from "@/components/binders/PageNavigator";
import { SlotActionMenu } from "@/components/binders/SlotActionMenu";
import { apiClient, ApiClientError } from "@/lib/api-client";
import type { BinderDetail, BinderSlot, SearchCard } from "@/lib/binders";
import { layoutLabel, slotsForPage } from "@/lib/binders";

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
  const [slotMenuOpen, setSlotMenuOpen] = useState(false);

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

    if (slot.cardExternalId) {
      setSlotMenuOpen(true);
    } else {
      setSearchOpen(true);
    }
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
    };

    updateSlotInState(optimistic);
    setSearchOpen(false);
    setSlotMenuOpen(false);
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

  async function clearSlot() {
    if (!binder || !activeSlot) {
      return;
    }

    const { pageIndex, row, col } = activeSlot;
    const previous = { ...activeSlot };

    const optimistic: BinderSlot = {
      ...activeSlot,
      cardExternalId: null,
      cardName: null,
      imageUrl: null,
      variant: "normal",
    };

    updateSlotInState(optimistic);
    setSlotMenuOpen(false);
    setActiveSlot(null);

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
    <div className="space-y-8">
      <BinderHeader
        name={binder.name}
        layoutLabel={layoutLabel(binder.layout)}
        pageCount={binder.pageCount}
        onRename={handleRename}
        onDelete={handleDelete}
      />

      {actionError && (
        <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {actionError}
        </p>
      )}

      <PageNavigator
        currentPage={currentPage}
        totalPages={binder.pageCount}
        onPageChange={setCurrentPage}
      />

      <BinderGrid layout={binder.layout} slots={pageSlots} onSlotSelect={handleSlotSelect} />

      {slotMenuOpen && activeSlot && (
        <SlotActionMenu
          slot={activeSlot}
          onReplace={() => {
            setSlotMenuOpen(false);
            setSearchOpen(true);
          }}
          onClear={() => void clearSlot()}
          onClose={() => {
            setSlotMenuOpen(false);
            setActiveSlot(null);
          }}
        />
      )}

      <CardSearchModal
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

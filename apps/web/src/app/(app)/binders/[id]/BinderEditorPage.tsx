"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CardVariant } from "@rebind/shared";
import { PLANS } from "@rebind/shared";
import { BinderGridSkeleton } from "@/components/binders/BinderGridSkeleton";
import { BinderHeader } from "@/components/binders/BinderHeader";
import { BinderPageView } from "@/components/binders/BinderPageView";
import { CardSearchPanel } from "@/components/cards/CardSearchPanel";
import { PageNavigator } from "@/components/binders/PageNavigator";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { apiClient, ApiClientError } from "@/lib/api-client";
import type { BinderDetail, BinderLayout, BinderSlot, SearchCard } from "@/lib/binders";
import { layoutLabel, maxPagesForLimits, slotsForPage } from "@/lib/binders";
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
import { useIsMobile } from "@/hooks/use-media-query";
import type { SlotDragPayload } from "@/lib/slot-drag";

type SwapResponse = {
  source: BinderSlot;
  target: BinderSlot;
};

type BinderEditorPageProps = {
  binderId: string;
};

export default function BinderEditorPage({ binderId }: BinderEditorPageProps) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const [binder, setBinder] = useState<BinderDetail | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeSlot, setActiveSlot] = useState<BinderSlot | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [moveModeSlot, setMoveModeSlot] = useState<BinderSlot | null>(null);
  const [cardSize, setCardSize] = useState<CardSizeLevel>(
    () => loadBinderPreferences(binderId).cardSize
  );
  const [pageViewMode, setPageViewMode] = useState<PageViewMode>(
    () => loadBinderPreferences(binderId).pageViewMode
  );
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [pageDirection, setPageDirection] = useState<"next" | "prev" | null>(null);
  const [openSlotMenuKey, setOpenSlotMenuKey] = useState<string | null>(null);

  const maxPages = maxPagesForLimits(user?.limits?.maxBinders ?? PLANS.free.maxBinders);

  const spreads = useMemo(
    () => (binder ? buildBinderSpreads(binder.pageCount) : []),
    [binder]
  );

  const effectiveViewMode: PageViewMode = isMobile ? "single" : pageViewMode;

  function showActionError(message: string) {
    showToast(message, "error");
  }

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
    setMoveModeSlot(null);
  }, [binderId]);

  useEffect(() => {
    if (!moveModeSlot) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMoveModeSlot(null);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [moveModeSlot]);

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

  function updateSlotsInState(updates: BinderSlot[]) {
    setBinder((current) => {
      if (!current) {
        return current;
      }

      const byKey = new Map(
        updates.map((slot) => [`${slot.pageIndex}-${slot.row}-${slot.col}`, slot])
      );

      return {
        ...current,
        slots: current.slots.map((slot) => {
          const key = `${slot.pageIndex}-${slot.row}-${slot.col}`;
          return byKey.get(key) ?? slot;
        }),
      };
    });
  }

  function handleSlotSelect(slot: BinderSlot) {
    if (moveModeSlot) {
      return;
    }

    setActiveSlot(slot);
    setSearchOpen(true);
  }

  function handleSlotReplace(slot: BinderSlot) {
    setActiveSlot(slot);
    setSearchOpen(true);
  }

  async function placeCard(card: SearchCard) {
    if (!binder || !activeSlot) {
      return;
    }

    if (!card.imageUrl) {
      showActionError("This card has no image available.");
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
      showToast("Card placed");
    } catch (err) {
      updateSlotInState(previous);
      const message =
        err instanceof ApiClientError ? err.message : "Failed to place card.";
      showActionError(message);
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
      showToast("Card removed");
    } catch (err) {
      updateSlotInState(previous);
      const message =
        err instanceof ApiClientError ? err.message : "Failed to clear slot.";
      showActionError(message);
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
      showActionError(message);
    }
  }

  async function changeSlotVariant(slot: BinderSlot, variant: CardVariant) {
    if (!binder || !slot.cardExternalId || slot.variant === variant) {
      return;
    }

    const { pageIndex, row, col } = slot;
    const previous = { ...slot };
    const optimistic: BinderSlot = { ...slot, variant };

    updateSlotInState(optimistic);

    try {
      const updated = await apiClient.patch<BinderSlot>(
        `/binders/${binder.id}/pages/${pageIndex}/slots/${row}/${col}`,
        { variant }
      );
      updateSlotInState(updated);
      showToast("Variant updated");
    } catch (err) {
      updateSlotInState(previous);
      const message =
        err instanceof ApiClientError ? err.message : "Failed to update variant.";
      showActionError(message);
    }
  }

  async function swapSlots(source: SlotDragPayload, target: BinderSlot) {
    if (!binder) {
      return;
    }

    const sourceSlot = binder.slots.find(
      (slot) =>
        slot.pageIndex === source.pageIndex &&
        slot.row === source.row &&
        slot.col === source.col
    );

    if (!sourceSlot?.cardExternalId) {
      return;
    }

    const previousSource = { ...sourceSlot };
    const previousTarget = { ...target };

    const targetHasCard = Boolean(target.cardExternalId);
    const optimisticSource: BinderSlot = targetHasCard
      ? { ...sourceSlot, ...cardFieldsFrom(target) }
      : {
          ...sourceSlot,
          cardExternalId: null,
          cardName: null,
          imageUrl: null,
          variant: "normal",
          owned: true,
        };
    const optimisticTarget: BinderSlot = { ...target, ...cardFieldsFrom(sourceSlot) };

    updateSlotsInState([optimisticSource, optimisticTarget]);
    setMoveModeSlot(null);

    try {
      const result = await apiClient.post<SwapResponse>(`/binders/${binder.id}/slots/swap`, {
        source: { page: source.pageIndex, row: source.row, col: source.col },
        target: { page: target.pageIndex, row: target.row, col: target.col },
      });
      updateSlotsInState([result.source, result.target]);
      showToast("Card moved");
    } catch (err) {
      updateSlotsInState([previousSource, previousTarget]);
      const message =
        err instanceof ApiClientError ? err.message : "Failed to move card.";
      showActionError(message);
    }
  }

  async function handleRename(name: string) {
    if (!binder) {
      return;
    }

    const updated = await apiClient.patch<BinderDetail>(`/binders/${binder.id}`, { name });
    setBinder(updated);
    showToast("Binder renamed");
  }

  async function handleDuplicate() {
    if (!binder) {
      return;
    }

    try {
      const copy = await apiClient.post<BinderDetail>(`/binders/${binder.id}/duplicate`, {});
      await refreshUser();
      showToast("Binder duplicated");
      router.push(`/binders/${copy.id}`);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Failed to duplicate binder.";
      showActionError(message);
      throw err;
    }
  }

  async function handleSettingsSave(input: { pageCount: number; layout: BinderLayout }) {
    if (!binder) {
      return;
    }

    const payload: { pageCount?: number; layout?: BinderLayout } = {};

    if (input.pageCount !== binder.pageCount) {
      payload.pageCount = input.pageCount;
    }

    if (input.layout !== binder.layout) {
      payload.layout = input.layout;
    }

    const updated = await apiClient.patch<BinderDetail>(`/binders/${binder.id}`, payload);
    setBinder(updated);

    if (currentPage > updated.pageCount) {
      setCurrentPage(updated.pageCount);
      setCurrentSpreadIndex(spreadIndexForPage(updated.pageCount));
    }

    showToast("Binder settings saved");
  }

  async function handleDelete() {
    if (!binder) {
      return;
    }

    await apiClient.delete(`/binders/${binder.id}`);
    showToast("Binder deleted");
    router.push("/binders");
  }

  if (loading) {
    return (
      <div className="flex w-full min-h-0 max-w-full flex-1 flex-col gap-3 pb-14 sm:-mx-6 sm:-mb-8 sm:gap-6 sm:px-6">
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
          <div className="h-8 w-64 animate-pulse rounded bg-zinc-800" />
        </div>
        <BinderGridSkeleton layout="GRID_3X3" cardSize={5} />
      </div>
    );
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
    <div className="flex w-full min-h-0 max-w-full flex-1 flex-col gap-3 pb-14 sm:-mx-6 sm:-mb-8 sm:gap-6 sm:px-6">
      {moveModeSlot && (
        <p className="rounded-lg border border-brand-700/50 bg-brand-950/30 px-3 py-2 text-sm text-brand-200">
          Tap a slot to move this card. Press Escape to cancel.
        </p>
      )}

      <BinderHeader
        binder={binder}
        layoutLabel={layoutLabel(binder.layout)}
        maxPages={maxPages}
        cardSize={cardSize}
        onCardSizeChange={handleCardSizeChange}
        pageViewMode={pageViewMode}
        onPageViewModeChange={handlePageViewModeChange}
        onRename={handleRename}
        onDuplicate={handleDuplicate}
        onSettingsSave={handleSettingsSave}
        onDelete={handleDelete}
        isMobile={isMobile}
      />

      <div className="w-full min-w-0 flex-1">
        <BinderPageView
          layout={binder.layout}
          viewMode={effectiveViewMode}
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
          moveModeSlot={moveModeSlot}
          isMobile={isMobile}
          swipeEnabled={isMobile && !moveModeSlot && !searchOpen && openSlotMenuKey === null}
          onOpenMenuKeyChange={setOpenSlotMenuKey}
          onPageChange={handlePageChange}
          onSpreadChange={handleSpreadChange}
          onSlotSelect={handleSlotSelect}
          onSlotReplace={handleSlotReplace}
          onSlotToggleOwned={(slot) => void toggleSlotOwned(slot)}
          onSlotVariantChange={(slot, variant) => void changeSlotVariant(slot, variant)}
          onSlotClear={(slot) => void clearSlot(slot)}
          onSlotSwap={(source, target) => void swapSlots(source, target)}
          onMoveModeStart={setMoveModeSlot}
          onMoveModeEnd={() => setMoveModeSlot(null)}
        />
      </div>

      <PageNavigator
        viewMode={effectiveViewMode}
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

function cardFieldsFrom(slot: BinderSlot) {
  return {
    cardExternalId: slot.cardExternalId,
    cardName: slot.cardName,
    imageUrl: slot.imageUrl,
    variant: slot.variant,
    owned: slot.owned,
  };
}

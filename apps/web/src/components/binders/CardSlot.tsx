"use client";

import { useRef, useState } from "react";
import { cardVariantLabel, type CardVariant } from "@rebind/shared";
import type { BinderSlot } from "@/lib/binders";
import { encodeSlotDrag, SLOT_DRAG_MIME } from "@/lib/slot-drag";
import { SlotOptionsMenu } from "./SlotOptionsMenu";

const LONG_PRESS_MS = 500;

type CardSlotProps = {
  slot: BinderSlot;
  mobile?: boolean;
  menuOpen?: boolean;
  moveModeActive?: boolean;
  isMoveSource?: boolean;
  isDropTarget?: boolean;
  onSelect: () => void;
  onReplace: () => void;
  onToggleOwned: () => void;
  onVariantChange: (variant: CardVariant) => void;
  onClear: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrop?: () => void;
  onMoveStart?: () => void;
  onMoveTarget?: () => void;
  onMenuOpenChange?: (open: boolean) => void;
};

function VariantBadge({ variant }: { variant: string }) {
  if (variant === "normal") {
    return null;
  }

  const label = cardVariantLabel(variant as CardVariant);

  return (
    <span className="absolute bottom-1 left-1 z-[1] rounded bg-black/70 px-1 py-0.5 text-[10px] font-medium leading-none text-zinc-200 backdrop-blur-sm">
      {variant === "reverse" ? "Rev" : label}
    </span>
  );
}

export function CardSlot({
  slot,
  mobile = false,
  menuOpen = false,
  moveModeActive = false,
  isMoveSource = false,
  isDropTarget = false,
  onSelect,
  onReplace,
  onToggleOwned,
  onVariantChange,
  onClear,
  onDragStart,
  onDragEnd,
  onDrop,
  onMoveStart,
  onMoveTarget,
  onMenuOpenChange,
}: CardSlotProps) {
  const [imageError, setImageError] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const longPressFired = useRef(false);
  const filled = Boolean(slot.cardExternalId);
  const unownedClass = slot.owned ? "" : "grayscale transition duration-300 group-hover:grayscale-0";

  function clearLongPressTimer() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleTouchStart(event: React.TouchEvent) {
    if (!filled || !mobile || moveModeActive) {
      return;
    }

    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    longPressFired.current = false;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    clearLongPressTimer();
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onMenuOpenChange?.(true);
    }, LONG_PRESS_MS);
  }

  function handleTouchMove(event: React.TouchEvent) {
    const start = touchStartRef.current;
    if (!start || !longPressTimer.current) {
      return;
    }

    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    const deltaX = Math.abs(touch.clientX - start.x);
    const deltaY = Math.abs(touch.clientY - start.y);

    if (deltaX > 10 || deltaY > 10) {
      clearLongPressTimer();
    }
  }

  function handleTouchEnd() {
    clearLongPressTimer();
    touchStartRef.current = null;

    if (longPressFired.current) {
      window.setTimeout(() => {
        longPressFired.current = false;
      }, 100);
    }
  }

  const highlightClass =
    isMoveSource || dragOver || isDropTarget
      ? "ring-2 ring-brand-500 ring-offset-1 ring-offset-zinc-950"
      : "";

  if (!filled) {
    const emptyClick = moveModeActive && onMoveTarget ? onMoveTarget : onSelect;

    return (
      <button
        type="button"
        onClick={emptyClick}
        onDragOver={(event) => {
          if (!moveModeActive) {
            event.preventDefault();
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          onDrop?.();
        }}
        className={`group relative aspect-[5/7] w-full overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-950/80 transition hover:border-brand-500/60 hover:ring-1 hover:ring-brand-500/40 ${highlightClass}`}
        aria-label={moveModeActive ? "Move card here" : "Empty slot"}
      >
        <div className="flex h-full items-center justify-center">
          <span className="text-2xl text-zinc-700 transition group-hover:text-zinc-500">+</span>
        </div>
      </button>
    );
  }

  if (moveModeActive) {
    return (
      <button
        type="button"
        onClick={isMoveSource ? undefined : onMoveTarget}
        disabled={isMoveSource}
        className={`group relative aspect-[5/7] w-full overflow-hidden rounded-lg ${highlightClass} ${
          isMoveSource ? "opacity-60" : "hover:ring-2 hover:ring-brand-500"
        }`}
        aria-label={isMoveSource ? "Moving this card" : "Move card here"}
      >
        <VariantBadge variant={slot.variant} />
        {slot.imageUrl && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slot.imageUrl}
            alt={slot.cardName ?? "Card"}
            className={`h-full w-full rounded-lg object-contain ${unownedClass}`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`flex h-full flex-col items-center justify-center gap-1 rounded-lg bg-zinc-950/80 p-2 text-center ${unownedClass}`}
          >
            <span className="line-clamp-2 text-xs font-medium text-zinc-300">{slot.cardName}</span>
          </div>
        )}
      </button>
    );
  }

  return (
    <div
      className={`group relative aspect-[5/7] w-full select-none ${menuOpen ? "z-50 overflow-visible" : "z-0 overflow-hidden"} ${highlightClass}`}
      draggable={!mobile}
      onDragStart={(event) => {
        event.dataTransfer.setData(SLOT_DRAG_MIME, encodeSlotDrag(slot));
        event.dataTransfer.effectAllowed = "move";
        onDragStart?.();
      }}
      onDragEnd={() => {
        setDragOver(false);
        onDragEnd?.();
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <SlotOptionsMenu
        slot={slot}
        open={menuOpen}
        onOpenChange={(open) => onMenuOpenChange?.(open)}
        onReplace={onReplace}
        onToggleOwned={onToggleOwned}
        onVariantChange={onVariantChange}
        onClear={onClear}
        onMove={mobile && onMoveStart ? onMoveStart : undefined}
        showTrigger={!mobile}
      />

      <div
        className="h-full w-full overflow-hidden rounded-lg"
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          onDrop?.();
        }}
      >
        <VariantBadge variant={slot.variant} />
        {slot.imageUrl && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slot.imageUrl}
            alt={slot.cardName ?? "Card"}
            loading="lazy"
            draggable={false}
            className={`h-full w-full object-contain ${unownedClass}`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`flex h-full flex-col items-center justify-center gap-1 bg-zinc-950/80 p-2 text-center ${unownedClass}`}
          >
            <span className="text-xs text-zinc-500">No image</span>
            <span className="line-clamp-2 text-xs font-medium text-zinc-300">{slot.cardName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

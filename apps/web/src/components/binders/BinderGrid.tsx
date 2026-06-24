"use client";

import { useRef, useState } from "react";
import type { CardVariant } from "@rebind/shared";
import type { BinderLayout, BinderSlot } from "@/lib/binders";
import { gridDimensions } from "@/lib/binders";
import { gridMaxWidthClass, type CardSizeLevel } from "@/lib/card-size";
import { slotKey, type SlotDragPayload } from "@/lib/slot-drag";
import { CardSlot } from "./CardSlot";

type BinderGridProps = {
  layout: BinderLayout;
  slots: BinderSlot[];
  cardSize?: CardSizeLevel;
  spread?: boolean;
  mobile?: boolean;
  moveModeSlot?: BinderSlot | null;
  onSlotSelect: (slot: BinderSlot) => void;
  onSlotReplace: (slot: BinderSlot) => void;
  onSlotToggleOwned: (slot: BinderSlot) => void;
  onSlotVariantChange: (slot: BinderSlot, variant: CardVariant) => void;
  onSlotClear: (slot: BinderSlot) => void;
  onSlotSwap: (source: SlotDragPayload, target: BinderSlot) => void;
  onMoveModeStart?: (slot: BinderSlot) => void;
  onMoveModeEnd?: () => void;
  onOpenMenuKeyChange?: (key: string | null) => void;
};

export function BinderGrid({
  layout,
  slots,
  cardSize = 3,
  spread = false,
  mobile = false,
  moveModeSlot = null,
  onSlotSelect,
  onSlotReplace,
  onSlotToggleOwned,
  onSlotVariantChange,
  onSlotClear,
  onSlotSwap,
  onMoveModeStart,
  onMoveModeEnd,
  onOpenMenuKeyChange,
}: BinderGridProps) {
  const { cols } = gridDimensions(layout);
  const widthClass =
    mobile || spread
      ? "mx-auto w-full max-w-full"
      : `mx-auto ${gridMaxWidthClass(cardSize)}`;
  const gapClass = mobile ? "gap-2" : "gap-1.5 sm:gap-2 md:gap-3";
  const draggingRef = useRef<SlotDragPayload | null>(null);
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);

  function handleMenuOpenChange(key: string, open: boolean) {
    const next = open ? key : null;
    setOpenMenuKey(next);
    onOpenMenuKeyChange?.(next);
  }

  function resolveDrop(target: BinderSlot, payload: SlotDragPayload | null) {
    const source = payload ?? moveModeSlot;

    if (!source) {
      return;
    }

    if (
      source.pageIndex === target.pageIndex &&
      source.row === target.row &&
      source.col === target.col
    ) {
      return;
    }

    onSlotSwap(source, target);
    draggingRef.current = null;
    onMoveModeEnd?.();
  }

  return (
    <div
      className={`grid transition-[max-width] duration-300 ease-out ${gapClass} ${widthClass}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {slots.map((slot) => {
        const key = slotKey(slot);
        const isMoveSource = moveModeSlot ? slotKey(moveModeSlot) === key : false;

        return (
          <CardSlot
            key={key}
            slot={slot}
            mobile={mobile}
            menuOpen={openMenuKey === key}
            moveModeActive={Boolean(moveModeSlot)}
            isMoveSource={isMoveSource}
            onSelect={() => onSlotSelect(slot)}
            onReplace={() => onSlotReplace(slot)}
            onToggleOwned={() => onSlotToggleOwned(slot)}
            onVariantChange={(variant) => onSlotVariantChange(slot, variant)}
            onClear={() => onSlotClear(slot)}
            onDragStart={() => {
              draggingRef.current = slot;
            }}
            onDragEnd={() => {
              draggingRef.current = null;
            }}
            onMoveStart={() => onMoveModeStart?.(slot)}
            onMoveTarget={() => resolveDrop(slot, moveModeSlot)}
            onDrop={() => resolveDrop(slot, draggingRef.current)}
            onMenuOpenChange={(open) => handleMenuOpenChange(key, open)}
          />
        );
      })}
    </div>
  );
}

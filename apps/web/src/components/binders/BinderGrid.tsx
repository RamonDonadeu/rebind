import type { BinderLayout, BinderSlot } from "@/lib/binders";
import { gridDimensions } from "@/lib/binders";
import { gridMaxWidthClass, spreadPageWidthClass, type CardSizeLevel } from "@/lib/card-size";
import { CardSlot } from "./CardSlot";

type BinderGridProps = {
  layout: BinderLayout;
  slots: BinderSlot[];
  cardSize?: CardSizeLevel;
  spread?: boolean;
  onSlotSelect: (slot: BinderSlot) => void;
  onSlotReplace: (slot: BinderSlot) => void;
  onSlotToggleOwned: (slot: BinderSlot) => void;
  onSlotClear: (slot: BinderSlot) => void;
};

export function BinderGrid({
  layout,
  slots,
  cardSize = 3,
  spread = false,
  onSlotSelect,
  onSlotReplace,
  onSlotToggleOwned,
  onSlotClear,
}: BinderGridProps) {
  const { cols } = gridDimensions(layout);
  const widthClass = spread ? "w-full" : `mx-auto ${gridMaxWidthClass(cardSize)}`;

  return (
    <div
      className={`grid gap-2 transition-[max-width] duration-300 ease-out sm:gap-3 ${widthClass}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {slots.map((slot) => (
        <CardSlot
          key={`${slot.pageIndex}-${slot.row}-${slot.col}`}
          slot={slot}
          onSelect={() => onSlotSelect(slot)}
          onReplace={() => onSlotReplace(slot)}
          onToggleOwned={() => onSlotToggleOwned(slot)}
          onClear={() => onSlotClear(slot)}
        />
      ))}
    </div>
  );
}

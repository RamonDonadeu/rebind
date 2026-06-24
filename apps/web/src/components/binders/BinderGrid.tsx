import type { BinderLayout, BinderSlot } from "@/lib/binders";
import { gridDimensions } from "@/lib/binders";
import { CARD_SIZE_MAX_WIDTH, type CardSizeLevel } from "@/lib/card-size";
import { CardSlot } from "./CardSlot";

type BinderGridProps = {
  layout: BinderLayout;
  slots: BinderSlot[];
  cardSize?: CardSizeLevel;
  onSlotSelect: (slot: BinderSlot) => void;
  onSlotReplace: (slot: BinderSlot) => void;
  onSlotToggleOwned: (slot: BinderSlot) => void;
  onSlotClear: (slot: BinderSlot) => void;
};

export function BinderGrid({
  layout,
  slots,
  cardSize = 3,
  onSlotSelect,
  onSlotReplace,
  onSlotToggleOwned,
  onSlotClear,
}: BinderGridProps) {
  const { cols } = gridDimensions(layout);

  return (
    <div
      className={`mx-auto grid w-full gap-2 transition-[max-width] duration-300 ease-out sm:gap-3 ${CARD_SIZE_MAX_WIDTH[cardSize]}`}
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

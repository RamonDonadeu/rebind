import type { BinderLayout, BinderSlot } from "@/lib/binders";
import { gridDimensions } from "@/lib/binders";
import { CardSlot } from "./CardSlot";

type BinderGridProps = {
  layout: BinderLayout;
  slots: BinderSlot[];
  onSlotSelect: (slot: BinderSlot) => void;
};

export function BinderGrid({ layout, slots, onSlotSelect }: BinderGridProps) {
  const { cols } = gridDimensions(layout);

  return (
    <div
      className="grid gap-2 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {slots.map((slot) => (
        <CardSlot key={`${slot.pageIndex}-${slot.row}-${slot.col}`} slot={slot} onSelect={() => onSlotSelect(slot)} />
      ))}
    </div>
  );
}

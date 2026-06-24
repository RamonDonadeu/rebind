import type { BinderSlot } from "@/lib/binders";

export const SLOT_DRAG_MIME = "application/x-rebind-slot";

export type SlotDragPayload = {
  pageIndex: number;
  row: number;
  col: number;
};

export function slotKey(slot: Pick<BinderSlot, "pageIndex" | "row" | "col">): string {
  return `${slot.pageIndex}-${slot.row}-${slot.col}`;
}

export function encodeSlotDrag(slot: SlotDragPayload): string {
  return JSON.stringify(slot);
}

export function decodeSlotDrag(data: string): SlotDragPayload | null {
  try {
    const parsed = JSON.parse(data) as SlotDragPayload;
    if (
      typeof parsed.pageIndex === "number" &&
      typeof parsed.row === "number" &&
      typeof parsed.col === "number"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

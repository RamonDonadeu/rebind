import type { BinderLayout, Prisma } from "@rebind/db";
import { LAYOUT_SLOTS } from "@rebind/shared";

type DbClient = Prisma.TransactionClient | { binderSlot: Prisma.TransactionClient["binderSlot"] };

function slotRecords(
  binderId: string,
  layout: BinderLayout,
  startPage: number,
  endPage: number
) {
  const { rows, cols } = LAYOUT_SLOTS[layout];
  const slots = [];

  for (let pageIndex = startPage; pageIndex < endPage; pageIndex++) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        slots.push({ binderId, pageIndex, row, col });
      }
    }
  }

  return slots;
}

export async function createSlotsForBinder(
  db: DbClient,
  binderId: string,
  pageCount: number,
  layout: BinderLayout
) {
  const slots = slotRecords(binderId, layout, 0, pageCount);

  if (slots.length === 0) {
    return;
  }

  await db.binderSlot.createMany({ data: slots });
}

export async function createSlotsForPages(
  db: DbClient,
  binderId: string,
  layout: BinderLayout,
  startPage: number,
  endPage: number
) {
  const slots = slotRecords(binderId, layout, startPage, endPage);

  if (slots.length === 0) {
    return;
  }

  await db.binderSlot.createMany({ data: slots });
}

export function isValidSlotPosition(
  layout: BinderLayout,
  pageIndex: number,
  row: number,
  col: number,
  pageCount: number
): boolean {
  if (pageIndex < 0 || pageIndex >= pageCount) {
    return false;
  }

  const { rows, cols } = LAYOUT_SLOTS[layout];
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

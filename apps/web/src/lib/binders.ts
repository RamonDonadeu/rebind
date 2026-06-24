import { LAYOUT_SLOTS, PLANS, type BinderLayout } from "@rebind/shared";

export type { BinderLayout };

export type BinderSummary = {
  id: string;
  name: string;
  pageCount: number;
  layout: BinderLayout;
  createdAt?: string;
  updatedAt?: string;
};

export type BinderSlot = {
  id: string;
  pageIndex: number;
  row: number;
  col: number;
  cardExternalId: string | null;
  cardName: string | null;
  imageUrl: string | null;
  variant: string;
  owned: boolean;
};

export type BinderDetail = BinderSummary & {
  slots: BinderSlot[];
};

export type SearchCard = {
  externalId: string;
  name: string;
  imageUrl: string | null;
  setId: string;
  localId: string;
};

export type SearchResponse = {
  data: SearchCard[];
  pagination: { page: number; limit: number; total: number };
};

export function layoutLabel(layout: BinderLayout): string {
  return layout.replace("GRID_", "").replace("X", "×");
}

export function gridDimensions(layout: BinderLayout) {
  return LAYOUT_SLOTS[layout];
}

export function maxPagesForLimits(maxBinders: number): number {
  if (maxBinders > PLANS.free.maxBinders) {
    return PLANS.collector.maxPagesPerBinder;
  }
  return PLANS.free.maxPagesPerBinder;
}

export function slotsForPage(binder: BinderDetail, pageIndex: number): BinderSlot[] {
  const { rows, cols } = gridDimensions(binder.layout);
  const grid: BinderSlot[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const existing = binder.slots.find(
        (slot) => slot.pageIndex === pageIndex && slot.row === row && slot.col === col
      );

      grid.push(
        existing ?? {
          id: `${pageIndex}-${row}-${col}`,
          pageIndex,
          row,
          col,
          cardExternalId: null,
          cardName: null,
          imageUrl: null,
          variant: "normal",
          owned: true,
        }
      );
    }
  }

  return grid;
}

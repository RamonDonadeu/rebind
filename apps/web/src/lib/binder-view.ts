export type PageViewMode = "single" | "spread";

export type BinderSpread = {
  index: number;
  pages: number[];
  label: string;
  leftPage: number | null;
  rightPage: number | null;
};

export function buildBinderSpreads(totalPages: number): BinderSpread[] {
  if (totalPages <= 0) {
    return [];
  }

  const spreads: BinderSpread[] = [
    {
      index: 0,
      pages: [1],
      label: "1",
      leftPage: null,
      rightPage: 1,
    },
  ];

  for (let left = 2; left <= totalPages; left += 2) {
    const right = left + 1 <= totalPages ? left + 1 : null;
    const pages = right ? [left, right] : [left];

    spreads.push({
      index: spreads.length,
      pages,
      label: right ? `${left}–${right}` : `${left}`,
      leftPage: left,
      rightPage: right,
    });
  }

  return spreads;
}

export function spreadIndexForPage(page: number): number {
  if (page <= 1) {
    return 0;
  }

  return 1 + Math.floor((page - 2) / 2);
}

export function clampSpreadIndex(index: number, totalPages: number): number {
  const spreads = buildBinderSpreads(totalPages);
  return Math.min(Math.max(0, index), spreads.length - 1);
}

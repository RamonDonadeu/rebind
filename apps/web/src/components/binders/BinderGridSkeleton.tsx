import type { BinderLayout } from "@/lib/binders";
import { gridDimensions } from "@/lib/binders";
import { gridMaxWidthClass, type CardSizeLevel } from "@/lib/card-size";

type BinderGridSkeletonProps = {
  layout: BinderLayout;
  cardSize?: CardSizeLevel;
};

export function BinderGridSkeleton({ layout, cardSize = 3 }: BinderGridSkeletonProps) {
  const { rows, cols } = gridDimensions(layout);
  const slotCount = rows * cols;

  return (
    <div
      className={`grid gap-2 sm:gap-3 mx-auto ${gridMaxWidthClass(cardSize)}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {Array.from({ length: slotCount }, (_, index) => (
        <div
          key={index}
          className="aspect-[5/7] w-full animate-pulse rounded-lg bg-zinc-800/60"
        />
      ))}
    </div>
  );
}

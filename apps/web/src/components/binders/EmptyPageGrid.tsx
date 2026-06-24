import { gridDimensions, type BinderLayout } from "@/lib/binders";

type EmptyPageGridProps = {
  layout: BinderLayout;
};

export function EmptyPageGrid({ layout }: EmptyPageGridProps) {
  const { rows, cols } = gridDimensions(layout);
  const slotCount = rows * cols;

  return (
    <div
      className="grid w-full gap-2 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: slotCount }, (_, index) => (
        <div
          key={index}
          aria-hidden
          className="aspect-[5/7] w-full rounded-lg border border-dashed border-zinc-800/80 bg-zinc-950/40"
        />
      ))}
    </div>
  );
}

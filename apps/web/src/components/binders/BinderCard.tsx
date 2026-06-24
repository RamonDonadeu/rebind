import Link from "next/link";
import type { BinderSummary } from "@/lib/binders";
import { layoutLabel } from "@/lib/binders";

type BinderCardProps = {
  binder: BinderSummary;
};

export function BinderCard({ binder }: BinderCardProps) {
  return (
    <Link
      href={`/binders/${binder.id}`}
      className="block rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-600 hover:bg-zinc-900/80"
    >
      <h2 className="font-semibold text-zinc-100">{binder.name}</h2>
      <p className="mt-1 text-sm text-zinc-500">
        {binder.pageCount} pages · {layoutLabel(binder.layout)}
      </p>
    </Link>
  );
}

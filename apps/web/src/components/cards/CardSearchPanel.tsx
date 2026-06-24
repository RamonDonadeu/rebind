"use client";

import type { SearchCard } from "@/lib/cards";
import { CardSearch } from "./CardSearch";

type CardSearchPanelProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (card: SearchCard) => void;
  title?: string;
};

export function CardSearchPanel({
  open,
  onClose,
  onSelect,
  title = "Add card",
}: CardSearchPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close card search"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-900 shadow-2xl sm:max-w-lg"
      >
        <CardSearch variant="expanded" enabled={open} title={title} onSelect={onSelect} onClose={onClose} />
      </aside>
    </>
  );
}

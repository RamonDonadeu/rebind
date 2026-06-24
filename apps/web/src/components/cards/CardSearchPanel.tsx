"use client";

import type { SearchCard } from "@/lib/cards";
import { useCardSearch } from "@/hooks/useCardSearch";
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
  const search = useCardSearch({ enabled: open });

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close card search"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
        />
      )}

      <aside
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-label={title}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-900 shadow-2xl transition-transform duration-200 ease-out sm:max-w-lg ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <CardSearch
          variant="expanded"
          title={title}
          search={search}
          onSelect={onSelect}
          onClose={onClose}
        />
      </aside>
    </>
  );
}

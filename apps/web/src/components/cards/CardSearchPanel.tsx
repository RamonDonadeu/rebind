"use client";

import { useEffect } from "react";
import type { SearchCard } from "@/lib/cards";
import { useCardSearch } from "@/hooks/useCardSearch";
import { useIsMobile } from "@/hooks/use-media-query";
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
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

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
        className={`fixed z-50 flex w-full max-w-[100vw] flex-col overflow-hidden border-zinc-800 bg-zinc-900 shadow-2xl transition-transform duration-200 ease-out inset-0 border-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:max-w-lg sm:border-l ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <CardSearch
          variant={isMobile ? "compact" : "expanded"}
          panelOpen={open}
          title={title}
          search={search}
          onSelect={onSelect}
          onClose={onClose}
        />
      </aside>
    </>
  );
}

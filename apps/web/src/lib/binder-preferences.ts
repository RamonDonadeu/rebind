import {
  CARD_SIZE_LEVELS,
  DEFAULT_CARD_SIZE,
  type CardSizeLevel,
} from "@/lib/card-size";
import type { PageViewMode } from "@/lib/binder-view";

const STORAGE_KEY = "rebind:binder-preferences";

export type BinderPreferences = {
  pageViewMode: PageViewMode;
  cardSize: CardSizeLevel;
};

export const DEFAULT_BINDER_PREFERENCES: BinderPreferences = {
  pageViewMode: "single",
  cardSize: DEFAULT_CARD_SIZE,
};

function isCardSizeLevel(value: unknown): value is CardSizeLevel {
  return (
    typeof value === "number" &&
    CARD_SIZE_LEVELS.includes(value as CardSizeLevel)
  );
}

function isPageViewMode(value: unknown): value is PageViewMode {
  return value === "single" || value === "spread";
}

function readAll(): Record<string, Partial<BinderPreferences>> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, Partial<BinderPreferences>>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, BinderPreferences>): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota or privacy mode errors.
  }
}

export function loadBinderPreferences(binderId: string): BinderPreferences {
  const stored = readAll()[binderId];

  return {
    pageViewMode: isPageViewMode(stored?.pageViewMode)
      ? stored.pageViewMode
      : DEFAULT_BINDER_PREFERENCES.pageViewMode,
    cardSize: isCardSizeLevel(stored?.cardSize)
      ? stored.cardSize
      : DEFAULT_BINDER_PREFERENCES.cardSize,
  };
}

export function saveBinderPreferences(
  binderId: string,
  patch: Partial<BinderPreferences>
): BinderPreferences {
  const current = loadBinderPreferences(binderId);
  const next: BinderPreferences = { ...current, ...patch };
  const all = readAll() as Record<string, BinderPreferences>;

  all[binderId] = next;
  writeAll(all);

  return next;
}

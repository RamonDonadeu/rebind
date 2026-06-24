export const PLANS = {
  free: {
    id: "free" as const,
    name: "Free",
    maxBinders: 1,
    maxPagesPerBinder: 24,
    priceHistory: false,
  },
  collector: {
    id: "collector" as const,
    name: "Collector",
    maxBinders: 50,
    maxPagesPerBinder: 48,
    priceHistory: true,
  },
} as const;

export type PlanTier = keyof typeof PLANS;

export type BinderLayout = "GRID_3X3" | "GRID_3X4";

export type CardVariant = "normal" | "reverse" | "holo";

export const LAYOUT_SLOTS: Record<BinderLayout, { rows: number; cols: number }> = {
  GRID_3X3: { rows: 3, cols: 3 },
  GRID_3X4: { rows: 3, cols: 4 },
};

export function slotsPerPage(layout: BinderLayout): number {
  const { rows, cols } = LAYOUT_SLOTS[layout];
  return rows * cols;
}

export function isDevFullPlanEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.DEV_FULL_PLAN === "true";
}

export function maxBindersForPlan(
  planTier: PlanTier,
  subscriptionStatus: "none" | "active" | "past_due" | "canceled"
): number {
  if (isDevFullPlanEnabled()) {
    return PLANS.collector.maxBinders;
  }

  if (planTier === "collector" && subscriptionStatus === "active") {
    return PLANS.collector.maxBinders;
  }
  return PLANS.free.maxBinders;
}

export function maxPagesForPlan(
  planTier: PlanTier,
  subscriptionStatus: "none" | "active" | "past_due" | "canceled"
): number {
  if (isDevFullPlanEnabled()) {
    return PLANS.collector.maxPagesPerBinder;
  }

  if (planTier === "collector" && subscriptionStatus === "active") {
    return PLANS.collector.maxPagesPerBinder;
  }
  return PLANS.free.maxPagesPerBinder;
}

export const API_ERROR_CODES = {
  BINDER_LIMIT_REACHED: "BINDER_LIMIT_REACHED",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  TCGDEX_UNAVAILABLE: "TCGDEX_UNAVAILABLE",
  RATE_LIMITED: "RATE_LIMITED",
} as const;

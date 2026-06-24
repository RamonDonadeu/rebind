import type { Binder, BinderLayout, BinderSlot, CardVariant, User } from "@rebind/db";
import { prisma } from "@rebind/db";
import {
  API_ERROR_CODES,
  maxBindersForPlan,
  maxPagesForPlan,
  type PlanTier,
} from "@rebind/shared";
import { appError } from "../lib/errors.js";
import {
  createSlotsForBinder,
  createSlotsForPages,
  isValidSlotPosition,
} from "../lib/slots.js";

type BinderWithSlots = Binder & { slots: BinderSlot[] };

function toBinderSummary(binder: Binder) {
  return {
    id: binder.id,
    name: binder.name,
    pageCount: binder.pageCount,
    layout: binder.layout,
    createdAt: binder.createdAt,
    updatedAt: binder.updatedAt,
  };
}

function toSlot(slot: BinderSlot) {
  return {
    id: slot.id,
    pageIndex: slot.pageIndex,
    row: slot.row,
    col: slot.col,
    cardExternalId: slot.cardExternalId,
    cardName: slot.cardName,
    imageUrl: slot.imageUrl,
    variant: slot.variant,
    owned: slot.owned,
  };
}

function toBinderDetail(binder: BinderWithSlots) {
  return {
    ...toBinderSummary(binder),
    slots: binder.slots
      .sort((a, b) => a.pageIndex - b.pageIndex || a.row - b.row || a.col - b.col)
      .map(toSlot),
  };
}

function maxPagesForUser(user: Pick<User, "planTier" | "subscriptionStatus">): number {
  return maxPagesForPlan(user.planTier as PlanTier, user.subscriptionStatus);
}

async function findOwnedBinder(binderId: string, userId: string): Promise<Binder | null> {
  return prisma.binder.findFirst({
    where: { id: binderId, userId },
  });
}

async function findOwnedBinderWithSlots(
  binderId: string,
  userId: string
): Promise<BinderWithSlots | null> {
  return prisma.binder.findFirst({
    where: { id: binderId, userId },
    include: {
      slots: {
        orderBy: [{ pageIndex: "asc" }, { row: "asc" }, { col: "asc" }],
      },
    },
  });
}

async function requireOwnedBinder(binderId: string, userId: string): Promise<Binder> {
  const binder = await findOwnedBinder(binderId, userId);

  if (!binder) {
    throw appError(404, API_ERROR_CODES.NOT_FOUND, "Binder not found");
  }

  return binder;
}

async function requireOwnedBinderWithSlots(
  binderId: string,
  userId: string
): Promise<BinderWithSlots> {
  const binder = await findOwnedBinderWithSlots(binderId, userId);

  if (!binder) {
    throw appError(404, API_ERROR_CODES.NOT_FOUND, "Binder not found");
  }

  return binder;
}

async function assertBinderLimit(user: Pick<User, "id" | "planTier" | "subscriptionStatus">) {
  const count = await prisma.binder.count({ where: { userId: user.id } });
  const limit = maxBindersForPlan(user.planTier as PlanTier, user.subscriptionStatus);

  if (count >= limit) {
    throw appError(
      403,
      API_ERROR_CODES.BINDER_LIMIT_REACHED,
      "Free plan allows 1 binder. Upgrade to create more."
    );
  }
}

async function binderHasCards(binderId: string): Promise<boolean> {
  const filled = await prisma.binderSlot.count({
    where: { binderId, cardExternalId: { not: null } },
  });
  return filled > 0;
}

export async function listBinders(userId: string) {
  const binders = await prisma.binder.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return binders.map(toBinderSummary);
}

export async function createBinder(
  user: Pick<User, "id" | "planTier" | "subscriptionStatus">,
  input: { name: string; pageCount: number; layout: BinderLayout }
) {
  await assertBinderLimit(user);

  const binder = await prisma.$transaction(async (tx) => {
    const created = await tx.binder.create({
      data: {
        userId: user.id,
        name: input.name,
        pageCount: input.pageCount,
        layout: input.layout,
      },
    });

    await createSlotsForBinder(tx, created.id, input.pageCount, input.layout);

    return created;
  });

  return getBinder(user.id, binder.id);
}

export async function getBinder(userId: string, binderId: string) {
  const binder = await requireOwnedBinderWithSlots(binderId, userId);
  return toBinderDetail(binder);
}

export async function updateBinder(
  user: Pick<User, "id" | "planTier" | "subscriptionStatus">,
  binderId: string,
  input: { name?: string; pageCount?: number; layout?: BinderLayout }
) {
  const binder = await requireOwnedBinder(binderId, user.id);
  const maxPages = maxPagesForUser(user);

  if (input.pageCount !== undefined && (input.pageCount < 1 || input.pageCount > maxPages)) {
    throw appError(
      400,
      API_ERROR_CODES.VALIDATION_ERROR,
      `pageCount must be between 1 and ${maxPages}`
    );
  }

  if (input.layout !== undefined && input.layout !== binder.layout) {
    if (await binderHasCards(binder.id)) {
      throw appError(
        400,
        API_ERROR_CODES.VALIDATION_ERROR,
        "Cannot change layout while binder has cards. Clear all slots first."
      );
    }
  }

  const nextPageCount = input.pageCount ?? binder.pageCount;
  const nextLayout = input.layout ?? binder.layout;

  await prisma.$transaction(async (tx) => {
    if (input.pageCount !== undefined && input.pageCount < binder.pageCount) {
      await tx.binderSlot.deleteMany({
        where: {
          binderId: binder.id,
          pageIndex: { gte: input.pageCount },
        },
      });
    }

    if (input.pageCount !== undefined && input.pageCount > binder.pageCount) {
      await createSlotsForPages(
        tx,
        binder.id,
        binder.layout,
        binder.pageCount,
        input.pageCount
      );
    }

    if (input.layout !== undefined && input.layout !== binder.layout) {
      await tx.binderSlot.deleteMany({ where: { binderId: binder.id } });
      await createSlotsForBinder(tx, binder.id, nextPageCount, nextLayout);
    }

    await tx.binder.update({
      where: { id: binder.id },
      data: {
        name: input.name,
        pageCount: input.pageCount,
        layout: input.layout,
      },
    });
  });

  return getBinder(user.id, binder.id);
}

export async function deleteBinder(userId: string, binderId: string) {
  await requireOwnedBinder(binderId, userId);
  await prisma.binder.delete({ where: { id: binderId } });
}

export async function placeCard(
  userId: string,
  binderId: string,
  pageIndex: number,
  row: number,
  col: number,
  input: {
    cardExternalId: string;
    cardName: string;
    imageUrl: string;
    variant: CardVariant;
    owned?: boolean;
  }
) {
  const binder = await requireOwnedBinder(binderId, userId);

  if (!isValidSlotPosition(binder.layout, pageIndex, row, col, binder.pageCount)) {
    throw appError(404, API_ERROR_CODES.NOT_FOUND, "Slot not found");
  }

  const slot = await prisma.binderSlot.findUnique({
    where: {
      binderId_pageIndex_row_col: {
        binderId,
        pageIndex,
        row,
        col,
      },
    },
  });

  if (!slot) {
    throw appError(404, API_ERROR_CODES.NOT_FOUND, "Slot not found");
  }

  const owned =
    input.owned ?? (slot.cardExternalId !== null ? slot.owned : true);

  const updated = await prisma.binderSlot.update({
    where: { id: slot.id },
    data: {
      cardExternalId: input.cardExternalId,
      cardName: input.cardName,
      imageUrl: input.imageUrl,
      variant: input.variant,
      owned,
    },
  });

  return toSlot(updated);
}

type SlotCoordinates = {
  pageIndex: number;
  row: number;
  col: number;
};

async function requireSlot(
  binderId: string,
  userId: string,
  coordinates: SlotCoordinates
): Promise<{ binder: Binder; slot: BinderSlot }> {
  const binder = await requireOwnedBinder(binderId, userId);
  const { pageIndex, row, col } = coordinates;

  if (!isValidSlotPosition(binder.layout, pageIndex, row, col, binder.pageCount)) {
    throw appError(404, API_ERROR_CODES.NOT_FOUND, "Slot not found");
  }

  const slot = await prisma.binderSlot.findUnique({
    where: {
      binderId_pageIndex_row_col: {
        binderId,
        pageIndex,
        row,
        col,
      },
    },
  });

  if (!slot) {
    throw appError(404, API_ERROR_CODES.NOT_FOUND, "Slot not found");
  }

  return { binder, slot };
}

export async function updateSlot(
  userId: string,
  binderId: string,
  pageIndex: number,
  row: number,
  col: number,
  input: { owned?: boolean; variant?: CardVariant }
) {
  const { slot } = await requireSlot(binderId, userId, { pageIndex, row, col });

  if (!slot.cardExternalId) {
    throw appError(400, API_ERROR_CODES.VALIDATION_ERROR, "Cannot update an empty slot");
  }

  const data: { owned?: boolean; variant?: CardVariant } = {};

  if (input.owned !== undefined) {
    data.owned = input.owned;
  }

  if (input.variant !== undefined) {
    data.variant = input.variant;
  }

  const updated = await prisma.binderSlot.update({
    where: { id: slot.id },
    data,
  });

  return toSlot(updated);
}

export async function updateSlotOwned(
  userId: string,
  binderId: string,
  pageIndex: number,
  row: number,
  col: number,
  owned: boolean
) {
  return updateSlot(userId, binderId, pageIndex, row, col, { owned });
}

export async function clearSlot(
  userId: string,
  binderId: string,
  pageIndex: number,
  row: number,
  col: number
) {
  const { slot } = await requireSlot(binderId, userId, { pageIndex, row, col });

  const updated = await prisma.binderSlot.update({
    where: { id: slot.id },
    data: {
      cardExternalId: null,
      cardName: null,
      imageUrl: null,
      variant: "normal",
      owned: true,
    },
  });

  return toSlot(updated);
}

const EMPTY_SLOT_DATA = {
  cardExternalId: null,
  cardName: null,
  imageUrl: null,
  variant: "normal" as CardVariant,
  owned: true,
};

function cardDataFromSlot(slot: BinderSlot) {
  return {
    cardExternalId: slot.cardExternalId,
    cardName: slot.cardName,
    imageUrl: slot.imageUrl,
    variant: slot.variant,
    owned: slot.owned,
  };
}

export async function swapSlots(
  userId: string,
  binderId: string,
  source: SlotCoordinates,
  target: SlotCoordinates
) {
  if (
    source.pageIndex === target.pageIndex &&
    source.row === target.row &&
    source.col === target.col
  ) {
    throw appError(400, API_ERROR_CODES.VALIDATION_ERROR, "Source and target slots must differ");
  }

  const { slot: sourceSlot } = await requireSlot(binderId, userId, source);
  const { slot: targetSlot } = await requireSlot(binderId, userId, target);

  if (!sourceSlot.cardExternalId) {
    throw appError(400, API_ERROR_CODES.VALIDATION_ERROR, "Source slot is empty");
  }

  const sourceData = cardDataFromSlot(sourceSlot);
  const targetData = cardDataFromSlot(targetSlot);

  const [updatedSource, updatedTarget] = await prisma.$transaction([
    prisma.binderSlot.update({
      where: { id: sourceSlot.id },
      data: targetData.cardExternalId ? targetData : EMPTY_SLOT_DATA,
    }),
    prisma.binderSlot.update({
      where: { id: targetSlot.id },
      data: sourceData,
    }),
  ]);

  return {
    source: toSlot(updatedSource),
    target: toSlot(updatedTarget),
  };
}

export async function duplicateBinder(
  user: Pick<User, "id" | "planTier" | "subscriptionStatus">,
  binderId: string,
  name?: string
) {
  await assertBinderLimit(user);

  const source = await requireOwnedBinderWithSlots(binderId, user.id);
  const copyName = name?.trim() || `Copy of ${source.name}`;

  const binder = await prisma.$transaction(async (tx) => {
    const created = await tx.binder.create({
      data: {
        userId: user.id,
        name: copyName,
        pageCount: source.pageCount,
        layout: source.layout,
      },
    });

    if (source.slots.length > 0) {
      await tx.binderSlot.createMany({
        data: source.slots.map((slot) => ({
          binderId: created.id,
          pageIndex: slot.pageIndex,
          row: slot.row,
          col: slot.col,
          cardExternalId: slot.cardExternalId,
          cardName: slot.cardName,
          imageUrl: slot.imageUrl,
          variant: slot.variant,
          owned: slot.owned,
        })),
      });
    } else {
      await createSlotsForBinder(tx, created.id, source.pageCount, source.layout);
    }

    return created;
  });

  return getBinder(user.id, binder.id);
}

export function validatePageCountForUser(
  user: Pick<User, "planTier" | "subscriptionStatus">,
  pageCount: number
): void {
  const maxPages = maxPagesForUser(user);

  if (pageCount < 1 || pageCount > maxPages) {
    throw appError(
      400,
      API_ERROR_CODES.VALIDATION_ERROR,
      `pageCount must be between 1 and ${maxPages}`
    );
  }
}

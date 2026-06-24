import { z } from "zod";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { API_ERROR_CODES } from "@rebind/shared";
import { appError } from "../lib/errors.js";
import type { AuthenticatedRequest } from "../plugins/auth.js";
import {
  clearSlot,
  createBinder,
  deleteBinder,
  getBinder,
  listBinders,
  placeCard,
  updateBinder,
  updateSlotOwned,
  validatePageCountForUser,
} from "../services/binder.service.js";

const binderLayoutSchema = z.enum(["GRID_3X3", "GRID_3X4"]);
const cardVariantSchema = z.enum(["normal", "reverse", "holo"]);

const createBinderSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  pageCount: z.number().int().optional().default(24),
  layout: binderLayoutSchema.optional().default("GRID_3X3"),
});

const patchBinderSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    pageCount: z.number().int().optional(),
    layout: binderLayoutSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const placeCardSchema = z.object({
  cardExternalId: z.string().min(1),
  cardName: z.string().min(1),
  imageUrl: z.string().url(),
  variant: cardVariantSchema.optional().default("normal"),
  owned: z.boolean().optional(),
});

const patchSlotSchema = z.object({
  owned: z.boolean(),
});

function validationError(reply: FastifyReply, message: string) {
  return reply.status(400).send({
    error: {
      code: API_ERROR_CODES.VALIDATION_ERROR,
      message,
    },
  });
}

function parseSlotCoordinate(value: string, name: string): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw appError(400, API_ERROR_CODES.VALIDATION_ERROR, `Invalid ${name}`);
  }

  return parsed;
}

function getAuthUser(request: FastifyRequest) {
  return (request as AuthenticatedRequest).user;
}

export default async function binderRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/binders", async (request) => {
    const user = getAuthUser(request);
    return listBinders(user.id);
  });

  app.post("/binders", async (request, reply) => {
    const user = getAuthUser(request);
    const parsed = createBinderSchema.safeParse(request.body);

    if (!parsed.success) {
      return validationError(reply, parsed.error.issues[0]?.message ?? "Invalid request body");
    }

    try {
      validatePageCountForUser(user, parsed.data.pageCount);
      const binder = await createBinder(user, parsed.data);
      request.log.info(
        { event: "binder.created", binderId: binder.id, userId: user.id },
        "binder created"
      );
      return reply.status(201).send(binder);
    } catch (err) {
      const error = err as { code?: string; statusCode?: number };
      if (error.code === API_ERROR_CODES.BINDER_LIMIT_REACHED) {
        request.log.warn({ event: "binder.limit_reached", userId: user.id }, "binder limit reached");
      }
      throw err;
    }
  });

  app.get("/binders/:id", async (request) => {
    const user = getAuthUser(request);
    const { id } = request.params as { id: string };
    return getBinder(user.id, id);
  });

  app.patch("/binders/:id", async (request, reply) => {
    const user = getAuthUser(request);
    const { id } = request.params as { id: string };
    const parsed = patchBinderSchema.safeParse(request.body);

    if (!parsed.success) {
      return validationError(reply, parsed.error.issues[0]?.message ?? "Invalid request body");
    }

    if (parsed.data.pageCount !== undefined) {
      validatePageCountForUser(user, parsed.data.pageCount);
    }

    const binder = await updateBinder(user, id, parsed.data);
    request.log.info({ event: "binder.updated", binderId: id, userId: user.id }, "binder updated");
    return binder;
  });

  app.delete("/binders/:id", async (request, reply) => {
    const user = getAuthUser(request);
    const { id } = request.params as { id: string };

    await deleteBinder(user.id, id);
    request.log.info({ event: "binder.deleted", binderId: id, userId: user.id }, "binder deleted");
    return reply.status(204).send();
  });

  app.put("/binders/:id/pages/:page/slots/:row/:col", async (request, reply) => {
    const user = getAuthUser(request);
    const { id, page, row, col } = request.params as {
      id: string;
      page: string;
      row: string;
      col: string;
    };
    const parsed = placeCardSchema.safeParse(request.body);

    if (!parsed.success) {
      return validationError(reply, parsed.error.issues[0]?.message ?? "Invalid request body");
    }

    const pageIndex = parseSlotCoordinate(page, "page");
    const rowIndex = parseSlotCoordinate(row, "row");
    const colIndex = parseSlotCoordinate(col, "col");

    const slot = await placeCard(user.id, id, pageIndex, rowIndex, colIndex, parsed.data);
    request.log.info(
      {
        event: "slot.placed",
        binderId: id,
        pageIndex,
        row: rowIndex,
        col: colIndex,
        cardExternalId: parsed.data.cardExternalId,
      },
      "card placed in slot"
    );
    return reply.send(slot);
  });

  app.patch("/binders/:id/pages/:page/slots/:row/:col", async (request, reply) => {
    const user = getAuthUser(request);
    const { id, page, row, col } = request.params as {
      id: string;
      page: string;
      row: string;
      col: string;
    };
    const parsed = patchSlotSchema.safeParse(request.body);

    if (!parsed.success) {
      return validationError(reply, parsed.error.issues[0]?.message ?? "Invalid request body");
    }

    const pageIndex = parseSlotCoordinate(page, "page");
    const rowIndex = parseSlotCoordinate(row, "row");
    const colIndex = parseSlotCoordinate(col, "col");

    const slot = await updateSlotOwned(
      user.id,
      id,
      pageIndex,
      rowIndex,
      colIndex,
      parsed.data.owned
    );
    request.log.info(
      {
        event: "slot.ownership_updated",
        binderId: id,
        pageIndex,
        row: rowIndex,
        col: colIndex,
        owned: parsed.data.owned,
      },
      "slot ownership updated"
    );
    return reply.send(slot);
  });

  app.delete("/binders/:id/pages/:page/slots/:row/:col", async (request, reply) => {
    const user = getAuthUser(request);
    const { id, page, row, col } = request.params as {
      id: string;
      page: string;
      row: string;
      col: string;
    };

    const pageIndex = parseSlotCoordinate(page, "page");
    const rowIndex = parseSlotCoordinate(row, "row");
    const colIndex = parseSlotCoordinate(col, "col");

    const slot = await clearSlot(user.id, id, pageIndex, rowIndex, colIndex);
    request.log.info(
      { event: "slot.cleared", binderId: id, pageIndex, row: rowIndex, col: colIndex },
      "slot cleared"
    );
    return reply.send(slot);
  });
}

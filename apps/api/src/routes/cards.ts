import { z } from "zod";
import { CARD_SEARCH_SORT_OPTIONS } from "@rebind/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { API_ERROR_CODES } from "@rebind/shared";
import { getCardDetail, listSets, searchCards } from "../services/tcgdex.service.js";

const sortValues = CARD_SEARCH_SORT_OPTIONS.map((option) => option.value) as [
  (typeof CARD_SEARCH_SORT_OPTIONS)[number]["value"],
  ...(typeof CARD_SEARCH_SORT_OPTIONS)[number]["value"][],
];

const searchQuerySchema = z
  .object({
    q: z.string().trim().optional(),
    set: z.string().trim().min(1).optional(),
    rarity: z.string().trim().min(1).optional(),
    sort: z.enum(sortValues).optional().default("releaseDate"),
    order: z.enum(["asc", "desc"]).optional().default("asc"),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(24),
  })
  .superRefine((data, ctx) => {
    const queryLength = data.q?.length ?? 0;

    if (queryLength === 0 && !data.set) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter at least 2 characters or choose a set",
      });
      return;
    }

    if (queryLength > 0 && queryLength < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Search query must be at least 2 characters",
      });
    }
  });

function validationError(reply: FastifyReply, message: string) {
  return reply.status(400).send({
    error: {
      code: API_ERROR_CODES.VALIDATION_ERROR,
      message,
    },
  });
}

export default async function cardRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/cards/search", async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = searchQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return validationError(reply, parsed.error.issues[0]?.message ?? "Invalid query parameters");
    }

    const { q, ...rest } = parsed.data;

    return searchCards(
      {
        ...rest,
        q: q && q.length > 0 ? q : undefined,
      },
      request.log
    );
  });

  app.get("/cards/sets", async (request: FastifyRequest) => {
    const data = await listSets(request.log);
    return { data };
  });

  app.get("/cards/:externalId", async (request: FastifyRequest) => {
    const { externalId } = request.params as { externalId: string };
    return getCardDetail(externalId, request.log);
  });
}

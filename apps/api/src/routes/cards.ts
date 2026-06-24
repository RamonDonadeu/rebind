import { z } from "zod";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { API_ERROR_CODES } from "@rebind/shared";
import { getCardDetail, searchCards } from "../services/tcgdex.service.js";

const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "Search query is required"),
  set: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
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

    return searchCards(parsed.data, request.log);
  });

  app.get("/cards/:externalId", async (request: FastifyRequest) => {
    const { externalId } = request.params as { externalId: string };
    return getCardDetail(externalId, request.log);
  });
}

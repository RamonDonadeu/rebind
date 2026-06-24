import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

async function loggingPlugin(app: FastifyInstance) {
  app.addHook("onRequest", async (request: FastifyRequest) => {
    request.log.debug(
      {
        event: "request.start",
        method: request.method,
        url: request.url,
        requestId: request.id,
      },
      "incoming request"
    );
  });

  app.addHook("onResponse", async (request: FastifyRequest, reply: FastifyReply) => {
    const responseTime = reply.elapsedTime;

    const logPayload = {
      event: "request.complete",
      method: request.method,
      url: request.url,
      requestId: request.id,
      statusCode: reply.statusCode,
      responseTimeMs: Math.round(responseTime),
    };

    if (reply.statusCode >= 500) {
      request.log.error(logPayload, "request failed");
    } else if (reply.statusCode >= 400) {
      request.log.warn(logPayload, "request client error");
    } else {
      request.log.info(logPayload, "request completed");
    }
  });

  app.setErrorHandler((error, request, reply) => {
    const err = error as Error & { statusCode?: number; code?: string };
    const statusCode = err.statusCode ?? 500;

    request.log.error(
      {
        err,
        event: "request.error",
        method: request.method,
        url: request.url,
        requestId: request.id,
        statusCode,
      },
      err.message
    );

    reply.status(statusCode).send({
      error: {
        code: err.code ?? "INTERNAL_ERROR",
        message: statusCode >= 500 ? "Internal server error" : err.message,
      },
    });
  });
}

export default fp(loggingPlugin, {
  name: "rebind-logging",
});

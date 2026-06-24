import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { prisma } from "@rebind/db";
import { PLANS } from "@rebind/shared";
import { createLoggerConfig, getServiceName } from "./lib/logger.js";
import loggingPlugin from "./plugins/logging.js";
import authPlugin from "./plugins/auth.js";
import authRoutes from "./routes/auth.js";

const port = Number(process.env.API_PORT ?? 4000);
const host = "0.0.0.0";

const app = Fastify({
  logger: createLoggerConfig(),
  genReqId: (req) => {
    const header = req.headers["x-request-id"];
    if (typeof header === "string" && header.length > 0) return header;
    return randomUUID();
  },
  requestIdHeader: "x-request-id",
  disableRequestLogging: true,
});

await app.register(loggingPlugin);

await app.register(cookie);

await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  credentials: true,
});

await app.register(authPlugin);
await app.register(authRoutes);

app.get("/health", async (request) => {
  let db: "ok" | "error" = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    db = "error";
    request.log.error({ err, event: "health.db_check_failed" }, "database health check failed");
  }

  const status = db === "ok" ? "ok" : "degraded";
  if (status === "degraded") {
    request.log.warn({ event: "health.degraded", db }, "service degraded");
  }

  return {
    status,
    service: getServiceName(),
    version: "0.1.0",
    db,
    plans: {
      free: PLANS.free.maxBinders,
      collector: PLANS.collector.maxBinders,
    },
  };
});

app.get("/", async () => ({
  name: "ReBind API",
  docs: "/health",
}));

const start = async () => {
  try {
    await app.listen({ port, host });
    app.log.info(
      {
        event: "server.started",
        port,
        host,
        service: getServiceName(),
      },
      "ReBind API listening"
    );
  } catch (err) {
    app.log.fatal({ err, event: "server.start_failed" }, "failed to start server");
    process.exit(1);
  }
};

start();

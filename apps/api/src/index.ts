import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "@rebind/db";
import { PLANS } from "@rebind/shared";

const port = Number(process.env.API_PORT ?? 4000);
const host = "0.0.0.0";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  credentials: true,
});

app.get("/health", async () => {
  let db: "ok" | "error" = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "error";
  }

  return {
    status: db === "ok" ? "ok" : "degraded",
    service: "rebind-api",
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
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

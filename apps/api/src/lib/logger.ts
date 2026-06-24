import type { FastifyServerOptions } from "fastify";
import type { LoggerOptions } from "pino";

const REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "password",
  "passwordHash",
  "password_hash",
  "token",
  "refreshToken",
  "accessToken",
];

export function getLogLevel(): string {
  if (process.env.LOG_LEVEL) return process.env.LOG_LEVEL;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

export function getServiceName(): string {
  return process.env.LOG_SERVICE_NAME ?? "rebind-api";
}

/**
 * Structured logger config for Fastify (Pino).
 * Emits JSON to stdout — collected by Promtail/Loki or any log shipper.
 */
export function createLoggerConfig(): FastifyServerOptions["logger"] {
  const level = getLogLevel();
  const service = getServiceName();
  const environment = process.env.NODE_ENV ?? "development";

  const pinoOptions: LoggerOptions = {
    level,
    redact: {
      paths: REDACT_PATHS,
      censor: "[REDACTED]",
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    formatters: {
      level: (label) => ({ level: label }),
      bindings: (bindings) => ({
        pid: bindings.pid,
        hostname: bindings.hostname,
        service,
        environment,
      }),
    },
    messageKey: "msg",
  };

  if (process.env.LOG_PRETTY === "true") {
    return {
      ...pinoOptions,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    };
  }

  return pinoOptions;
}

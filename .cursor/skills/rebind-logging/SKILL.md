---
name: rebind-logging
description: >-
  Structured logging for ReBind API and the separate Loki/Grafana log stack.
  Use when adding logs, debugging production, configuring Promtail/Loki, or
  wiring new apps into centralized logging.
---

# ReBind Logging

## App-side (API)

- Logger: Pino via Fastify — config in `apps/api/src/lib/logger.ts`
- Hooks: `apps/api/src/plugins/logging.ts`
- **Never** `console.log` — use `request.log` or `app.log`
- Always include `event` field for searchable actions
- Sensitive fields auto-redacted

```ts
request.log.info({ event: "binder.created", binderId }, "binder created");
request.log.error({ err, event: "tcgdex.failed" }, "tcgdex request failed");
```

Env: `LOG_LEVEL`, `LOG_SERVICE_NAME`, `LOG_PRETTY`

## Central stack (separate)

`docker/logging/` — Loki + Grafana + Promtail. **Not** in main compose.

```bash
cd docker/logging && docker compose up -d
```

Grafana: http://localhost:3001

## Multi-app pattern

1. App emits JSON stdout with `service` field
2. Docker labels on container:
   ```yaml
   logging.enabled: "true"
   logging.app: "my-app-name"
   logging.env: "production"
   ```
3. Promtail on host collects all labeled containers

## Grafana queries

```logql
{app="rebind-api"} | json | level="error"
```

## Reference

[docs/LOGGING.md](../../docs/LOGGING.md)

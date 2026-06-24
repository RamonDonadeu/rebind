---
name: rebind-docker-deploy
description: >-
  Run and deploy ReBind with Docker Compose locally or on Dockploy. Use when
  configuring docker-compose, Dockerfiles, environment variables, migrations in
  containers, or production deployment.
---

# ReBind Docker & Deploy

## Compose files

| File | Use |
|------|-----|
| `docker-compose.yml` | Local dev — hot reload, exposed DB/Redis ports |
| `docker-compose.prod.yml` | Dockploy / production |

## Local dev

```bash
cp .env.example .env
docker compose up --build
```

Migrations: `docker compose exec api npm run db:migrate`

## Dockploy

1. Compose type application
2. Compose file: `docker-compose.prod.yml`
3. Set env vars in **Environment** tab → saved as `.env`
4. Services use `env_file: .env` per [Dockploy docs](https://docs.dokploy.com/docs/core/docker-compose)
5. **Redeploy/rebuild** after env changes

### Required production env

`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NEXT_PUBLIC_API_URL`, `CORS_ORIGIN`, `POSTGRES_*`

### Domains

- `web` → port 3000 (public UI)
- `api` → port 4000 (`NEXT_PUBLIC_API_URL`)

## Service names (Docker network)

Use hostnames `postgres`, `redis`, `api`, `web` — not `localhost` — inside containers.

```
DATABASE_URL=postgresql://rebind:rebind@postgres:5432/rebind
REDIS_URL=redis://redis:6379
```

## Volumes

- `postgres_data` — must be backed up
- Do not expose postgres/redis ports in prod compose

## References

- [docs/DOCKER.md](../../docs/DOCKER.md)
- [docs/DEPLOYMENT.md](../../docs/DEPLOYMENT.md)

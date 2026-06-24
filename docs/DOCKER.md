# Local Docker Development

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine + Compose (Linux)
- Git

## Setup

```bash
git clone https://github.com/RamonDonadeu/rebind.git
cd rebind
cp .env.example .env
docker compose up --build
```

First build installs dependencies and may take several minutes.

## Services

| Service | Host port | Internal | Description |
|---------|-----------|----------|-------------|
| web | 3000 | web:3000 | Next.js |
| api | 4000 | api:4000 | Fastify API |
| postgres | 5432 | postgres:5432 | PostgreSQL 16 |
| redis | 6379 | redis:6379 | Redis 7 |

## Common commands

```bash
# Start all services (foreground)
docker compose up

# Start detached
docker compose up -d

# Rebuild after dependency changes
docker compose up --build

# View logs
docker compose logs -f api

# Stop
docker compose down

# Stop and remove volumes (wipes DB)
docker compose down -v
```

## Database migrations

With stack running:

```bash
docker compose exec api npm run db:migrate
```

Or from host (requires local Node + `DATABASE_URL` pointing to localhost:5432):

```bash
npm install
npm run db:migrate
```

## Development without Docker

You can run Postgres and Redis via Docker and apps locally:

```bash
docker compose up postgres redis -d
cp .env.example .env
# Set DATABASE_URL=postgresql://rebind:rebind@localhost:5432/rebind
npm install
npm run dev
```

## File structure

```
docker-compose.yml          # Local dev: hot reload, exposed ports
docker-compose.prod.yml     # Production/Dockploy: optimized builds
apps/api/Dockerfile
apps/web/Dockerfile
```

## Centralized logging (optional)

Run the separate log stack to collect logs from ReBind and other apps:

```bash
cd docker/logging
cp .env.example .env
docker compose up -d
```

Grafana UI: http://localhost:3001 — see [LOGGING.md](LOGGING.md).

## Hot reload

`docker-compose.yml` runs the API with `tsx watch` and the web app with `next dev`, with source folders bind-mounted into the containers.

On **Windows** (and some Mac setups), the VM does not receive native file-change events from bind mounts. Compose sets `CHOKIDAR_USEPOLLING` and `WATCHPACK_POLLING` to `true` by default so saves on the host trigger reloads without `docker compose restart`.

After editing `package.json` or installing dependencies, rebuild:

```bash
docker compose up --build api web
```

## Troubleshooting

**Changes not reflected:** Ensure polling is enabled (`CHOKIDAR_USEPOLLING=true`, `WATCHPACK_POLLING=true` in `.env` or compose defaults). Recreate containers after compose changes: `docker compose up -d --force-recreate api web`.

**Port already in use:** Change `WEB_PORT` or `API_PORT` in `.env`.

**API can't connect to DB:** Wait for `postgres` healthcheck to pass; API `depends_on` with `condition: service_healthy`.

**Windows line endings:** If shell scripts fail, ensure `.gitattributes` enforces LF for `*.sh`.

## Health checks

- API: http://localhost:4000/health
- Web: http://localhost:3000

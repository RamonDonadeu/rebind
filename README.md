# ReBind

Digital Pokémon TCG binder collections — organize cards across binder pages (3×3, 3×4 grids), search cards via [TCGdex](https://tcgdex.dev/), and track collection value over time.

**Repository:** [github.com/RamonDonadeu/rebind](https://github.com/RamonDonadeu/rebind)

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend | Fastify, TypeScript |
| Database | PostgreSQL + Prisma |
| Cache | Redis (TCGdex proxy cache) |
| Card data | [TCGdex API](https://tcgdex.dev/) (free, no API key) |
| Deploy | Docker Compose → [Dockploy](https://docs.dokploy.com/docs/core/docker-compose) |

## Quick start (local)

```bash
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:4000 |
| API health | http://localhost:4000/health |

See [docs/DOCKER.md](docs/DOCKER.md) for details.

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/PLAN.md](docs/PLAN.md) | Product roadmap and phases |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design and data flow |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema and conventions |
| [docs/API.md](docs/API.md) | REST API specification |
| [docs/DOCKER.md](docs/DOCKER.md) | Local Docker development |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Dockploy production deployment |
| [docs/LOGGING.md](docs/LOGGING.md) | Structured logs + Loki/Grafana stack |
| [AGENTS.md](AGENTS.md) | AI agent context for this repo |

## Monorepo layout

```
rebind/
├── apps/
│   ├── api/          # Fastify backend
│   └── web/          # Next.js frontend
├── packages/
│   ├── db/           # Prisma schema & client
│   └── shared/       # Shared types & plan config
├── docs/
├── docker/
│   └── logging/      # Separate Loki + Grafana + Promtail stack
├── docker-compose.yml
└── docker-compose.prod.yml
```

## License

Private — all rights reserved (update when you choose a license).

# Tips Project

A multi-tenant HR platform for designing, scheduling, monitoring, and measuring polls. Built for recruitment, coaching, evaluations, and more.

## Features

- **Poll design and scheduling** -- create and distribute polls with flexible scheduling
- **Monitoring and analytics** -- track responses and measure results in real time
- **Multi-tenant architecture** -- companies grouped into organizations with isolated data
- **Role-based access control** -- super admin, organization admin, and company-level users
- **Use cases** -- recruitment screening, coaching feedback, performance evaluations, employee engagement surveys

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 21, Tailwind CSS 4, Apollo Client, SSR |
| Backend | NestJS 11, GraphQL (code-first), Apollo Server |
| Auth | [Better Auth](https://www.better-auth.com/) |
| Database | PostgreSQL, Prisma 7 |
| Monorepo | Nx 22 |
| Testing | Vitest (unit), Playwright (E2E) |

## Project Structure

```
tips-project/
├── apps/
│   ├── web-app/          # Angular frontend (SSR-enabled)
│   ├── web-app-e2e/      # Frontend E2E tests (Playwright)
│   ├── web-server/       # NestJS GraphQL API
│   └── web-server-e2e/   # Backend E2E tests
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── generated/
    └── prisma/           # Generated Prisma client
```

## Getting Started

### Prerequisites

- Node.js (LTS)
- PostgreSQL
- [Bun](https://bun.sh/) package manager

### Setup

```sh
# Install dependencies
bun install

# Set up your database connection
cp .env.example .env   # then edit DATABASE_URL

# Run database migrations
bunx prisma migrate dev

# Start both frontend and backend in dev mode
bun run serve:dev
```

The frontend runs at `http://localhost:4200` and proxies API requests to the backend at `http://localhost:3000`.

Copy [`.env.example`](.env.example) and set at least `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`.

## Cloud Deployment (Railway + Neon)

Production uses a **single public URL** per environment: the Angular SSR app proxies `/api` to the private NestJS service.

| Component | Hosting |
|-----------|---------|
| Database | [Neon](https://neon.tech) — `staging` branch + `main` (production) |
| API | Railway `web-server` (private networking) |
| Frontend | Railway `web-app` (public domain) |

### Environment variables

| Variable | Service | Description |
|----------|---------|-------------|
| `DATABASE_URL` | web-server | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | web-server | Random secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | web-server | Public app URL (e.g. `https://staging.example.com`) |
| `TRUSTED_ORIGINS` | web-server | Same URL as `BETTER_AUTH_URL` (comma-separated if multiple) |
| `API_URL` | web-app | Internal URL, e.g. `http://${{web-server.RAILWAY_PRIVATE_DOMAIN}}:${{web-server.PORT}}` |

### Setup guides

- [Neon branches (staging + production)](infra/neon/README.md)
- [Railway services and domains](infra/railway/README.md)

### Docker (local or CI)

```sh
docker build -f Dockerfile.web-server -t tips-web-server .
docker build -f Dockerfile.web-app -t tips-web-app .
```

### CI/CD

- **CI** (`.github/workflows/ci.yml`) — lint, test, build, e2e on every PR/push
- **Deploy** (`.github/workflows/deploy.yml`) — runs `prisma migrate deploy` after CI passes on `staging` or `main`; Railway auto-deploys via GitHub integration

Create a `staging` git branch for pre-production deploys. Configure GitHub environments `staging` and `production` with secrets `DATABASE_URL_STAGING`, `DATABASE_URL_PRODUCTION`, and optional `STAGING_URL` / `PRODUCTION_URL` for smoke tests.

## Development Commands

```sh
# Serve individual apps
bunx nx serve web-app
bunx nx serve web-server

# Build for production
bunx nx build web-app
bunx nx build web-server

# Run tests
bunx nx test web-app
bunx nx test web-server

# Lint
bunx nx lint web-app
bunx nx lint web-server

# Visualize project graph
bunx nx graph
```

## License

MIT

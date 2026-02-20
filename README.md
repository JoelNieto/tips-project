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

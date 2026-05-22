# Neon Database Setup (Staging + Production)

## Branches

| Environment | Neon branch | Railway secret |
|-------------|-------------|----------------|
| Staging | `staging` (child of `main`) | `DATABASE_URL` on staging `web-server` service |
| Production | `main` (default) | `DATABASE_URL` on production `web-server` service |

## 1. Neon project

Project: **tips-project** (`morning-moon-25817835`)

Created via Neon; connection strings live in the Neon console and Railway secrets only — never commit them.

## 2. Branches

| Branch | Neon branch ID | Use |
|--------|----------------|-----|
| `main` | `br-raspy-smoke-akdqt9jm` | Production (`DATABASE_URL` in production Railway env) |
| `staging` | `br-falling-sound-akahjiji` | Staging (`DATABASE_URL` in staging Railway env) |

Copy each branch’s **pooled** connection string from the Neon console.

## 3. Connection strings

For each branch, copy the **pooled** PostgreSQL connection string (`?sslmode=require`).

Set in Railway **web-server** service (per environment):

```
DATABASE_URL=postgresql://...@...-pooler....neon.tech/neondb?sslmode=require
```

Never commit connection strings. Use Railway shared variables per environment.

## 4. Initial migration

After `DATABASE_URL` is set locally or in CI:

```sh
bunx prisma migrate deploy
```

The `web-server` Docker entrypoint runs `prisma migrate deploy` on every deploy.

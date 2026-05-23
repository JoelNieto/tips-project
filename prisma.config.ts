import { defineConfig } from 'prisma/config';

// Prisma CLI loads `.env` from the project root automatically (local dev).
// Railway / GitHub inject DATABASE_URL directly — no dotenv import (not in Docker image).

/**
 * `prisma generate` does not connect to the database. Docker/Railway builds often
 * run generate without DATABASE_URL, so we use a placeholder unless the var is set.
 * `migrate deploy` at runtime must have a real DATABASE_URL (Railway / GitHub env).
 */
const databaseUrl =
  process.env['DATABASE_URL'] ??
  'postgresql://build:build@127.0.0.1:5432/build?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});

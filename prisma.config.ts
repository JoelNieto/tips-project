import 'dotenv/config';
import { defineConfig } from 'prisma/config';

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

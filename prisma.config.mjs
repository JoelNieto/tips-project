/**
 * Plain JS config so `prisma migrate deploy` works in Docker without node_modules
 * for `prisma/config` or TypeScript. Prisma CLI loads `.env` locally automatically.
 */
const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://build:build@127.0.0.1:5432/build?schema=public';

export default {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
};

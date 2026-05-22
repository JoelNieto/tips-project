import 'dotenv/config';

import { PrismaClient } from '@generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL'],
});

const prisma = new PrismaClient({ adapter });

function parseTrustedOrigins(): string[] {
  const raw = process.env['TRUSTED_ORIGINS'];
  if (raw) {
    return raw.split(',').map((o) => o.trim()).filter(Boolean);
  }
  return ['http://localhost:4200'];
}

export const auth = betterAuth({
  basePath: '/api/auth',
  baseURL: process.env['BETTER_AUTH_URL'],
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: parseTrustedOrigins(),
});

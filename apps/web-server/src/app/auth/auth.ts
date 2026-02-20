import 'dotenv/config';

import { PrismaClient } from '@generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL'],
});

const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  basePath: '/api/auth',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ['http://localhost:4200'],
});

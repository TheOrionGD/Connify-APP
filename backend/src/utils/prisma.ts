/**
 * PrismaClient singleton — prevents multiple client instances during
 * hot-reload in development (tsx watch creates a new module scope on
 * each reload, so we pin the client to globalThis).
 *
 * NOTE: Run `npm run prisma:generate` before starting the server.
 * The Prisma client is generated at backend/generated/prisma/.
 */
import { PrismaClient } from '../../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; pool?: Pool };

const pool = globalForPrisma.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

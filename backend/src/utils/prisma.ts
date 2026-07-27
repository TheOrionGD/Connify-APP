/**
 * PrismaClient singleton — prevents multiple client instances during
 * hot-reload in development.
 *
 * NOTE: Run `npm run prisma:generate` before starting the server.
 * The Prisma client is generated at backend/generated/prisma/.
 */
import { PrismaClient } from '../../generated/prisma';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

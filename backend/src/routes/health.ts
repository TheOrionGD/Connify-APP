/**
 * GET /health
 *
 * Returns server status, uptime, and connectivity for Redis and the
 * database. Designed for Render's health check probe and local dev use.
 */
import type { FastifyInstance } from 'fastify';
import { pingRedis } from '../services/RedisService';
import { prisma } from '../utils/prisma';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_req, reply) => {
    const redisPing = await pingRedis();

    let dbPing = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbPing = true;
    } catch {
      // DB may not be migrated yet — non-fatal for the health route
    }

    const status = redisPing && dbPing ? 'ok' : 'degraded';

    return reply.status(200).send({
      success: true,
      data: {
        status,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        services: {
          redis: redisPing ? 'connected' : 'disconnected',
          database: dbPing ? 'connected' : 'disconnected',
        },
      },
    });
  });
}

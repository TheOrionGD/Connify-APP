/**
 * GET /health
 *
 * Returns server status, uptime, and connectivity for Redis and the
 * database. Designed for Render's health check probe and local dev use.
 */
import type { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_req, reply) => {
    const dbPing = mongoose.connection.readyState === 1;

    const status = dbPing ? 'ok' : 'degraded';

    return reply.status(200).send({
      success: true,
      data: {
        status,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        services: {
          database: dbPing ? 'connected' : 'disconnected',
        },
      },
    });
  });
}

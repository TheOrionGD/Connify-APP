import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { getRedisClient } from './services/RedisService';
import { errorHandler } from './middleware/errorHandler';
import { healthRoutes } from './routes/health';
import { deviceRoutes } from './routes/devices';
import { episodeRoutes } from './routes/episodes';
import { capsuleRoutes } from './routes/capsules';
import { outcomeRoutes } from './routes/outcomes';
import { adminRoutes } from './routes/admin';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Global Error Handler
  app.setErrorHandler(errorHandler);

  // Plugins Registration
  app.register(cors, {
    origin: '*', // Adjust to client URL in production
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    redis: getRedisClient() as any, // Cast due to minor typings mismatch if any
  });

  // Root welcome route
  app.get('/', async () => {
    return {
      success: true,
      message: 'Connify Zero-Trust Backend Protocol Running 🚀',
      version: '1.0.0',
    };
  });

  // Register Routes
  app.register(healthRoutes);
  app.register(deviceRoutes, { prefix: '/api/devices' });
  app.register(episodeRoutes, { prefix: '/api/episodes' });
  app.register(capsuleRoutes, { prefix: '/api/capsules' });
  app.register(outcomeRoutes, { prefix: '/api/outcomes' });
  app.register(adminRoutes, { prefix: '/api/admin' });

  return app;
}
export { buildApp as app }; // Keep compatibility with existing imports
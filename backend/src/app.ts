import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { healthRoutes } from './routes/health';
import { deviceRoutes } from './routes/devices';
import { episodeRoutes } from './routes/episodes';
import { capsuleRoutes } from './routes/capsules';
import { outcomeRoutes } from './routes/outcomes';
import { adminRoutes } from './routes/admin';
import { profileRoutes } from './routes/profileRoutes';
import { authRoutes } from './routes/authRoutes';

export function buildApp(): FastifyInstance {
  const isProduction = env.NODE_ENV === 'production';
  const app = Fastify({
    logger: {
      level: isProduction ? 'info' : (process.env.LOG_LEVEL || 'debug'),
      transport:
        !isProduction
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
  });

  // Root welcome route
  app.get('/', async () => {
    return {
      success: true,
      message: 'Connify Zero-Trust Backend Protocol Running 🚀',
      version: '1.0.0',
    };
  });

  // Favicon route (prevents 404 route not found error logs)
  app.get('/favicon.ico', async (request, reply) => {
    return reply.status(204).send();
  });

  // Register Routes
  app.register(healthRoutes);
  app.register(deviceRoutes, { prefix: '/api/devices' });
  app.register(episodeRoutes, { prefix: '/api/episodes' });
  app.register(capsuleRoutes, { prefix: '/api/capsules' });
  app.register(outcomeRoutes, { prefix: '/api/outcomes' });
  app.register(adminRoutes, { prefix: '/api/admin' });
  app.register(profileRoutes, { prefix: '/api/profile' });
  app.register(authRoutes, { prefix: '/api/auth' });

  return app;
}
export { buildApp as app }; // Keep compatibility with existing imports
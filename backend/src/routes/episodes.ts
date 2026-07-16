/**
 * Episode routes — /api/episodes
 *
 * POST   /api/episodes          — create a help request episode
 * GET    /api/episodes/nearby   — disclosure-filtered nearby episodes
 * GET    /api/episodes/:id      — get episode status
 * PATCH  /api/episodes/:id/cancel — cancel an episode
 *
 * All routes require a valid device session JWT (authenticate preHandler).
 */
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';
import { EpisodeController } from '../controllers/EpisodeController';

const createBodySchema = z.object({
  category: z.enum(['medical', 'transport', 'general', 'emergency']),
  urgency: z.number().int().min(1).max(5),
  /** Short context field — auto-limited to prevent oversharing (§5) */
  context: z.string().max(280).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().min(50).max(5000).default(500),
  bchSyndromes: z.string().min(1, 'bchSyndromes is required for SHARP proximity checks'),
  helperStringY: z.string().min(1, 'helperStringY is required for SHARP proximity checks'),
  gridCellsJson: z.string().min(1, 'gridCellsJson is required for SHARP proximity checks'),
});

const nearbyQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusMeters: z.coerce.number().int().min(50).max(5000).default(500),
});

function badRequest(reply: FastifyReply, message: string) {
  return reply.status(400).send({
    success: false,
    error: { code: 'VALIDATION_ERROR', message },
  });
}

export async function episodeRoutes(app: FastifyInstance): Promise<void> {
  // NOTE: /nearby must be registered before /:id to avoid route conflicts
  app.get(
    '/nearby',
    { preHandler: authenticate },
    async (req, reply) => {
      const parsed = nearbyQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return badRequest(reply, parsed.error.issues[0]?.message ?? 'Invalid query');
      }
      return EpisodeController.getNearby(parsed.data, reply);
    }
  );

  app.post(
    '/',
    { preHandler: authenticate },
    async (req, reply) => {
      const parsed = createBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(reply, parsed.error.issues[0]?.message ?? 'Invalid body');
      }
      const deviceId = req.devicePayload!.sub;
      return EpisodeController.create(deviceId, parsed.data, reply);
    }
  );

  app.get(
    '/:id',
    { preHandler: authenticate },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      return EpisodeController.getById(id, reply);
    }
  );

  app.patch(
    '/:id/cancel',
    { preHandler: authenticate },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const deviceId = req.devicePayload!.sub;
      return EpisodeController.cancel(id, deviceId, reply);
    }
  );
}

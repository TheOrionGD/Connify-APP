/**
 * Outcome routes — /api/outcomes
 *
 * POST /api/outcomes — log a minimal outcome record for a completed episode.
 *
 * By design, outcome records store ONLY: result, category, risk level,
 * and whether completion was within the capsule window. No identity,
 * location trail, or message content is persisted (§7.7, §8.1).
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';
import { OutcomeController } from '../controllers/OutcomeController';

const createBodySchema = z.object({
  episodeId: z.string().uuid('episodeId must be a valid UUID'),
  result: z.enum(['success', 'failure']),
  category: z.enum(['medical', 'transport', 'general', 'emergency']),
  /** 1–5 risk rating supplied by the completing party */
  riskLevel: z.number().int().min(1).max(5).optional(),
  /** Was the episode completed before the capsule expired? */
  completedInWindow: z.boolean(),
});

export async function outcomeRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/',
    { preHandler: authenticate },
    async (req, reply) => {
      const parsed = createBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Invalid body',
          },
        });
      }
      return OutcomeController.create(parsed.data, reply);
    }
  );
}

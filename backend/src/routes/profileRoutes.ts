import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ProfileController } from '../controllers/ProfileController';
import { authenticate } from '../middleware/authenticate';

const upsertProfileSchema = z.object({
  firstName: z.string().min(1, 'firstName is required'),
  lastName: z.string().min(1, 'lastName is required'),
  phone: z.string().optional(),
  medicalNotes: z.string().optional(),
});

function validationError(reply: any, message: string) {
  return reply.status(400).send({
    success: false,
    error: { code: 'VALIDATION_ERROR', message },
  });
}

export async function profileRoutes(app: FastifyInstance): Promise<void> {
  /** Upsert user profile associated with the authenticated device */
  app.post(
    '/',
    { preHandler: authenticate },
    async (req: any, reply) => {
      const parsed = upsertProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return validationError(reply, parsed.error.issues[0]?.message ?? 'Invalid body');
      }
      
      const deviceId = req.device?.id;
      if (!deviceId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Device not found in request' },
        });
      }

      return ProfileController.upsertProfile(parsed.data, deviceId, reply);
    }
  );
}

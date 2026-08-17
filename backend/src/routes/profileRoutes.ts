import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { ProfileController } from '../controllers/ProfileController';
import { authenticate } from '../middleware/authenticate';

const upsertProfileSchema = z.object({
  firstName: z.string().min(1, 'firstName is required'),
  lastName: z.string().min(1, 'lastName is required'),
  phone: z.string().optional(),
  medicalNotes: z.string().optional(),
  firebaseUid: z.string().optional(),
  email: z.string().email().optional(),
  isAnonymous: z.boolean().optional(),
});

const upgradeProfileSchema = z.object({
  firebaseUid: z.string().optional(),
  firstName: z.string().min(1, 'firstName is required'),
  lastName: z.string().min(1, 'lastName is required'),
  phone: z.string().min(1, 'phone is required'),
  email: z.string().email().optional(),
  guardian: z.object({
    fullName: z.string().min(1, 'guardian fullName is required'),
    phone: z.string().min(1, 'guardian phone is required'),
    relationship: z.string().min(1, 'guardian relationship is required'),
    email: z.string().email().optional(),
    fcmToken: z.string().optional(),
  }),
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
    async (req: FastifyRequest, reply) => {
      const parsed = upsertProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return validationError(reply, parsed.error.issues[0]?.message ?? 'Invalid body');
      }
      
      const deviceId = req.devicePayload?.sub;
      if (!deviceId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Device not found in request' },
        });
      }

      return ProfileController.upsertProfile(parsed.data, deviceId, reply);
    }
  );

  /** Upgrade anonymous profile to permanent registered profile with mandatory guardian */
  app.post(
    '/upgrade',
    { preHandler: authenticate },
    async (req: FastifyRequest, reply) => {
      const parsed = upgradeProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return validationError(reply, parsed.error.issues[0]?.message ?? 'Invalid body');
      }

      const deviceId = req.devicePayload?.sub;
      if (!deviceId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Device not found in request' },
        });
      }

      return ProfileController.upgradeProfile(parsed.data, deviceId, reply);
    }
  );

  /** Fetch user profile for the authenticated device */
  app.get(
    '/',
    { preHandler: authenticate },
    async (req: FastifyRequest, reply) => {
      const deviceId = req.devicePayload?.sub;
      if (!deviceId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Device not found in request' },
        });
      }

      return ProfileController.getProfile(deviceId, reply);
    }
  );
}

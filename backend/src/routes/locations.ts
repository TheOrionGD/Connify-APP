import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';
import { LocationController } from '../controllers/LocationController';

const pingBodySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  batteryLevel: z.number().optional(),
});

const guardianBodySchema = z.object({
  userFullName: z.string().min(1, 'userFullName is required'),
  fullName: z.string().min(1, 'fullName is required'),
  phone: z.string().min(1, 'phone is required'),
  relationship: z.string().min(1, 'relationship is required'),
});

export async function locationRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/ping',
    { preHandler: authenticate },
    async (req, reply) => {
      const parsed = pingBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid body' },
        });
      }
      const deviceId = req.devicePayload!.sub;
      return LocationController.pingLocation(deviceId, parsed.data, reply);
    }
  );

  app.post(
    '/guardians',
    { preHandler: authenticate },
    async (req, reply) => {
      const parsed = guardianBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid body' },
        });
      }
      const deviceId = req.devicePayload!.sub;
      return LocationController.createGuardian(deviceId, parsed.data, reply);
    }
  );

  app.post(
    '/watchdog/scan',
    { preHandler: authenticate },
    async (req, reply) => {
      return LocationController.triggerWatchdogScan(reply);
    }
  );
}

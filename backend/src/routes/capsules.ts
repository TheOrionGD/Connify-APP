/**
 * Capsule routes — /api/capsules
 *
 * POST /api/capsules/issue     — issue a Trust Capsule (post-verification)
 * POST /api/capsules/redeem    — single-use redemption (atomic DB transaction)
 * POST /api/capsules/:id/revoke — revoke an active capsule
 *
 * All routes require authentication.
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';
import { CapsuleController } from '../controllers/CapsuleController';

const issueBodySchema = z.object({
  episodeId: z.string().uuid('episodeId must be a valid UUID'),
  helperDeviceId: z.string().uuid('helperDeviceId must be a valid UUID'),
  /** Verification signals collected during the QR/GPS handshake */
  verificationData: z.object({
    qrToken: z.string().min(1, 'qrToken is required for verification'),
    blindedGridCell: z.string().min(1, 'blindedGridCell is required for logging'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

const redeemBodySchema = z.object({
  /** The compact JWS trust capsule token issued by /capsules/issue */
  capsuleToken: z.string().min(1, 'capsuleToken is required'),
});

export async function capsuleRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/issue',
    { preHandler: authenticate },
    async (req, reply) => {
      const parsed = issueBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Invalid body',
          },
        });
      }
      return CapsuleController.issue(parsed.data, reply);
    }
  );

  app.post(
    '/redeem',
    { preHandler: authenticate },
    async (req, reply) => {
      const parsed = redeemBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Invalid body',
          },
        });
      }
      const deviceId = req.devicePayload!.sub;
      return CapsuleController.redeem(parsed.data.capsuleToken, deviceId, reply);
    }
  );

  app.post(
    '/:id/revoke',
    { preHandler: authenticate },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      return CapsuleController.revoke(id, reply);
    }
  );

  app.post(
    '/verify-qr',
    { preHandler: authenticate },
    async (req, reply) => {
      return CapsuleController.verifyQrEndpoint(req, reply);
    }
  );
}

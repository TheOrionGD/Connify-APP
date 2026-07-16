/**
 * Device routes — /api/devices
 *
 * POST /api/devices/register  — register a device fingerprint + public key
 * POST /api/devices/verify    — challenge/response verification (Phase 11)
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { DeviceController } from '../controllers/DeviceController';
import { authenticateFirebase } from '../middleware/authenticateFirebase';
import { authenticate } from '../middleware/authenticate';

const registerBodySchema = z.object({
  /** SHA-256 hex of the device-bound identifier (64 chars) */
  deviceFingerprintHash: z
    .string()
    .length(64, 'deviceFingerprintHash must be a 64-char SHA-256 hex string'),
  /** Device's Ed25519 public key in SPKI PEM or base64 format */
  publicKey: z.string().min(1, 'publicKey is required'),
  /** Optional hashed phone number for phone-based lookup */
  phoneHash: z.string().optional(),
});

const verifyBodySchema = z.object({
  /** Server-issued challenge nonce */
  challenge: z.string().min(1),
  /** Client signature of the challenge using the device private key */
  signature: z.string().min(1),
});

function validationError(reply: Parameters<typeof DeviceController.register>[1], message: string) {
  return reply.status(400).send({
    success: false,
    error: { code: 'VALIDATION_ERROR', message },
  });
}

export async function deviceRoutes(app: FastifyInstance): Promise<void> {
  /** Register or re-register a device. Returns a signed session JWT. */
  app.post(
    '/register',
    { preHandler: authenticateFirebase },
    async (req, reply) => {
      const parsed = registerBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return validationError(reply, parsed.error.issues[0]?.message ?? 'Invalid body');
      }
      return DeviceController.register(parsed.data, reply);
    }
  );

  /** Device verification handshake. Full implementation in Phase 11. */
  app.post(
    '/verify',
    { preHandler: authenticate },
    async (req, reply) => {
      const parsed = verifyBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return validationError(reply, parsed.error.issues[0]?.message ?? 'Invalid body');
      }
      return DeviceController.verify(parsed.data, reply);
    }
  );
}

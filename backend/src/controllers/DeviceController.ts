/**
 * DeviceController — business logic for device registration and verification.
 *
 * Upserts device records by fingerprint hash (same device = same record),
 * issues a signed 30-day session JWT on success.
 */
import type { FastifyReply } from 'fastify';
import { prisma } from '../utils/prisma';
import { signToken } from '../services/KeyService';
import nacl from 'tweetnacl';

interface RegisterInput {
  deviceFingerprintHash: string;
  publicKey: string;
  phoneHash?: string;
}

interface VerifyInput {
  challenge: string;
  signature: string;
}

export const DeviceController = {
  async register(input: RegisterInput, reply: FastifyReply): Promise<void> {
    try {
      const req = reply.request;
      const firebaseUser = req.firebaseUser;
      if (!firebaseUser) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Firebase token verification failed' },
        });
      }

      console.log(`Registering device for Firebase user: ${firebaseUser.uid} (${firebaseUser.email})`);

      // Upsert — the same device can re-register to rotate its public key.
      const device = await prisma.device.upsert({
        where: { deviceFingerprintHash: input.deviceFingerprintHash },
        create: {
          deviceFingerprintHash: input.deviceFingerprintHash,
          publicKey: input.publicKey,
          phoneHash: input.phoneHash ?? null,
        },
        update: {
          publicKey: input.publicKey,
          lastSeenAt: new Date(),
        },
      });

      // Override the `sub` claim with the device UUID (signToken uses setIssuedAt,
      // so we pass sub in the payload directly)
      const sessionToken = await signToken(
        {
          type: 'device_session',
          sub: device.id,
          fingerprint: device.deviceFingerprintHash,
        },
        '30d'
      );

      reply.status(201).send({
        success: true,
        data: {
          deviceId: device.id,
          token: sessionToken,
          tokenType: 'Bearer',
          expiresIn: '30d',
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(500).send({
        success: false,
        error: { code: 'REGISTRATION_FAILED', message },
      });
    }
  },

  /**
   * Cryptographic challenge/response verification.
   * Verifies the client signature of the challenge using the registered device public key.
   */
  async verify(input: VerifyInput, reply: FastifyReply): Promise<void> {
    try {
      const req = reply.request;
      const deviceId = req.devicePayload?.sub;
      if (!deviceId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Missing device session payload' },
        });
      }

      const device = await prisma.device.findUnique({
        where: { id: deviceId },
      });

      if (!device) {
        return reply.status(404).send({
          success: false,
          error: { code: 'DEVICE_NOT_FOUND', message: 'Registered device not found' },
        });
      }

      const publicKeyBuffer = Buffer.from(device.publicKey, 'hex');
      const signatureBuffer = Buffer.from(input.signature, 'hex');
      const challengeBuffer = Buffer.from(input.challenge);

      const verified = nacl.sign.detached.verify(
        challengeBuffer,
        signatureBuffer,
        publicKeyBuffer
      );

      reply.status(200).send({
        success: true,
        data: {
          verified,
          message: verified
            ? 'Device verification handshake successful'
            : 'Signature verification failed for the provided challenge',
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(500).send({
        success: false,
        error: { code: 'VERIFICATION_FAILED', message },
      });
    }
  },
};

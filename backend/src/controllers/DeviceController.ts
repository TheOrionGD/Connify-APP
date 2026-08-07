/**
 * DeviceController — business logic for device registration and verification using Mongoose.
 */
import type { FastifyReply } from 'fastify';
import { randomBytes } from 'crypto';
import { Device, DeviceChallenge } from '../models';
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
      let device = await Device.findOne({ deviceFingerprintHash: input.deviceFingerprintHash });
      if (device) {
        device.publicKey = input.publicKey;
        device.lastSeenAt = new Date();
        if (input.phoneHash) device.phoneHash = input.phoneHash;
        await device.save();
      } else {
        device = await Device.create({
          deviceFingerprintHash: input.deviceFingerprintHash,
          publicKey: input.publicKey,
          phoneHash: input.phoneHash,
          lastSeenAt: new Date(),
        });
      }

      const deviceIdStr = device._id.toString();

      const sessionToken = await signToken(
        {
          type: 'device_session',
          sub: deviceIdStr,
          fingerprint: device.deviceFingerprintHash,
        },
        '30d'
      );

      reply.status(201).send({
        success: true,
        data: {
          deviceId: deviceIdStr,
          token: sessionToken,
          tokenType: 'Bearer',
          expiresIn: '30d',
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Device registration error:', err);
      reply.status(500).send({
        success: false,
        error: { code: 'REGISTRATION_FAILED', message },
      });
    }
  },

  async requestChallenge(reply: FastifyReply): Promise<void> {
    try {
      const req = reply.request;
      const deviceId = req.devicePayload?.sub;
      if (!deviceId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Missing device session payload' },
        });
      }

      // Purge any existing unconsumed challenge for this device
      await DeviceChallenge.deleteMany({ deviceId });

      const challengeHex = randomBytes(32).toString('hex');
      await DeviceChallenge.create({
        challenge: challengeHex,
        deviceId,
        createdAt: new Date(),
      });

      reply.status(201).send({
        success: true,
        data: {
          challenge: challengeHex,
          expiresInSeconds: 60,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(500).send({
        success: false,
        error: { code: 'CHALLENGE_REQUEST_FAILED', message },
      });
    }
  },

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

      // Atomically consume (delete) the challenge nonce on first attempt
      const consumedChallenge = await DeviceChallenge.findOneAndDelete({
        challenge: input.challenge,
      });

      if (!consumedChallenge) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'INVALID_OR_EXPIRED_CHALLENGE',
            message: 'Challenge nonce is invalid, expired, or already consumed',
          },
        });
      }

      if (consumedChallenge.deviceId.toString() !== deviceId) {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'CHALLENGE_DEVICE_MISMATCH',
            message: 'Challenge nonce was issued to a different device',
          },
        });
      }

      const device = await Device.findById(deviceId);
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

      if (!verified) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'SIGNATURE_VERIFICATION_FAILED',
            message: 'Signature verification failed for the provided challenge',
          },
        });
      }

      reply.status(200).send({
        success: true,
        data: {
          verified: true,
          message: 'Device verification handshake successful',
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


/**
 * CapsuleController — Trust Capsule issuance, redemption, and revocation using Mongoose.
 */
import type { FastifyReply } from 'fastify';
import { createHash } from 'node:crypto';
import nacl from 'tweetnacl';
import { Capsule, Episode, Device } from '../models';
import { writeAuditLog } from '../utils/audit';
import { signToken, verifyToken } from '../services/KeyService';

interface IssueInput {
  episodeId: string;
  helperDeviceId: string;
  verificationData: {
    qrToken: string;
    blindedGridCell: string;
    latitude?: number;
    longitude?: number;
  };
}

/** Trust Capsules are valid for 2 hours (the helper engagement window). */
const CAPSULE_TTL_MS = 2 * 60 * 60 * 1000;

export const CapsuleController = {
  async issue(input: IssueInput, reply: FastifyReply): Promise<void> {
    try {
      const [episode, helperDevice] = await Promise.all([
        Episode.findById(input.episodeId),
        Device.findById(input.helperDeviceId),
      ]);

      if (!episode) {
        return reply.status(404).send({
          success: false,
          error: { code: 'EPISODE_NOT_FOUND', message: 'Episode not found' },
        });
      }
      if (!['pending', 'matched'].includes(episode.status)) {
        return reply.status(409).send({
          success: false,
          error: {
            code: 'INVALID_EPISODE_STATE',
            message: `Episode status '${episode.status}' is not eligible for capsule issuance`,
          },
        });
      }
      if (!helperDevice) {
        return reply.status(404).send({
          success: false,
          error: { code: 'HELPER_NOT_FOUND', message: 'Helper device not found' },
        });
      }

      // 1. Downgrade grid-cell check to logging only
      const gridCells: string[] = episode.gridCellsJson ? JSON.parse(episode.gridCellsJson) : [];
      const isGridMatched = gridCells.includes(input.verificationData.blindedGridCell);
      if (!isGridMatched) {
        console.warn(`[ANOMALY] Grid-cell mismatch for episode ${episode.id}, but proceeding to QR check.`);
      }

      // 2. New Gate: QR Token Verification
      if (!input.verificationData.qrToken) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VERIFICATION_FAILED', message: 'QR token missing' },
        });
      }

      const isQrValid = await CapsuleController.verifyQrToken(input.verificationData.qrToken, episode.id, true);
      if (!isQrValid) {
        return reply.status(403).send({
          success: false,
          error: { code: 'PROXIMITY_VERIFICATION_FAILED', message: 'QR Token signature, expiry, or episode match failed' },
        });
      }

      const expiresAt = new Date(Date.now() + CAPSULE_TTL_MS);

      // Mint the capsule JWT — binds episode + helper + time window
      const capsuleToken = await signToken(
        {
          type: 'trust_capsule',
          sub: input.helperDeviceId,
          episodeId: input.episodeId,
          helperDeviceId: input.helperDeviceId,
          requesterId: episode.requesterDeviceId.toString(),
        },
        '2h'
      );

      // Store only the hash — the bearer token never touches the DB
      const tokenHash = createHash('sha256').update(capsuleToken).digest('hex');

      const capsule = await Capsule.create({
        episodeId: input.episodeId,
        helperDeviceId: input.helperDeviceId,
        signedTokenHash: tokenHash,
        blindedGridCell: input.verificationData.blindedGridCell,
        status: 'issued',
        expiresAt,
      });

      episode.status = 'matched';
      await episode.save();

      const capsuleIdStr = capsule._id.toString();

      // Write cryptographic audit log
      writeAuditLog('CAPSULE_ISSUED', input.episodeId).catch((err) =>
        console.warn('⚠️ Failed to write audit log:', err.message)
      );

      reply.status(201).send({
        success: true,
        data: {
          capsuleId: capsuleIdStr,
          capsuleToken,
          expiresAt: capsule.expiresAt.toISOString(),
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(500).send({
        success: false,
        error: { code: 'CAPSULE_ISSUE_FAILED', message },
      });
    }
  },

  async redeem(
    capsuleToken: string,
    requestingDeviceId: string,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // 1. Verify the JWT signature + expiry
      let jwtPayload: Record<string, unknown>;
      try {
        jwtPayload = (await verifyToken(capsuleToken)) as Record<string, unknown>;
      } catch {
        return reply.status(401).send({
          success: false,
          error: { code: 'INVALID_CAPSULE', message: 'Capsule token is invalid or expired' },
        });
      }

      if (jwtPayload['type'] !== 'trust_capsule') {
        return reply.status(400).send({
          success: false,
          error: { code: 'WRONG_TOKEN_TYPE', message: 'Provided token is not a trust capsule' },
        });
      }

      // 2. Atomically find and redeem the capsule
      const tokenHash = createHash('sha256').update(capsuleToken).digest('hex');
      const now = new Date();
      
      const capsule = await Capsule.findOneAndUpdate(
        { signedTokenHash: tokenHash, status: 'issued', helperDeviceId: requestingDeviceId },
        { $set: { status: 'redeemed', redeemedAt: now } },
        { new: true }
      );

      if (!capsule) {
        return reply.status(409).send({
          success: false,
          error: { code: 'INVALID_OR_USED', message: 'Capsule already used, invalid, or forbidden' },
        });
      }

      await Episode.findByIdAndUpdate(capsule.episodeId, { status: 'active' });

      const capsuleIdStr = capsule._id.toString();
      const episodeIdStr = capsule.episodeId.toString();

      // Write cryptographic audit log
      writeAuditLog('CAPSULE_REDEEMED', episodeIdStr).catch((err) =>
        console.warn('⚠️ Failed to write audit log:', err.message)
      );

      reply.status(200).send({
        success: true,
        data: {
          capsuleId: capsuleIdStr,
          episodeId: episodeIdStr,
          status: 'redeemed',
          redeemedAt: now.toISOString(),
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(500).send({
        success: false,
        error: { code: 'CAPSULE_REDEEM_FAILED', message },
      });
    }
  },

  async revoke(capsuleId: string, reply: FastifyReply): Promise<void> {
    try {
      const capsule = await Capsule.findOneAndUpdate(
        { _id: capsuleId, status: 'issued' },
        { $set: { status: 'revoked' } },
        { new: true }
      );

      if (!capsule) {
        return reply.status(409).send({
          success: false,
          error: { code: 'INVALID_OR_USED', message: 'Capsule not found, already used, or invalid state' },
        });
      }

      const episodeIdStr = capsule.episodeId.toString();

      // Write cryptographic audit log
      writeAuditLog('CAPSULE_REVOKED', episodeIdStr).catch((err) =>
        console.warn('⚠️ Failed to write audit log:', err.message)
      );

      reply.status(200).send({
        success: true,
        data: { capsuleId, status: 'revoked' },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(500).send({
        success: false,
        error: { code: 'REVOKE_FAILED', message },
      });
    }
  },

  // Dedicated verification endpoint/logic for the scanned QR token
  async verifyQrToken(qrToken: string, episodeId: string, consumeNonce = false): Promise<boolean> {
    try {
      const parts = qrToken.split('.');
      if (parts.length !== 3) return false;
      
      const [headerB64, payloadB64, signatureHex] = parts;
      const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
      const payload = JSON.parse(payloadStr);
      
      if (payload.episodeId !== episodeId) return false;
      if (Date.now() > payload.exp * 1000) return false;
      
      const episode = await Episode.findById(episodeId);
      if (!episode) return false;
      
      const requesterDevice = await Device.findById(episode.requesterDeviceId);
      if (!requesterDevice || !requesterDevice.publicKey) return false;
      
      // We use nacl here because the frontend secureKeyService produces a Hex-encoded signature
      const messageBytes = Buffer.from(`${headerB64}.${payloadB64}`, 'utf-8');
      const signatureBytes = Buffer.from(signatureHex, 'hex');
      const publicKeyBytes = Buffer.from(requesterDevice.publicKey, 'hex');
      
      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
      if (!isValid) return false;
      
      if (consumeNonce && payload.nonce) {
        const updated = await Episode.findOneAndUpdate(
          { _id: episodeId, usedQrNonces: { $ne: payload.nonce } },
          { $push: { usedQrNonces: payload.nonce } }
        );
        if (!updated) {
          console.warn('QR Token nonce reused:', payload.nonce);
          return false; // Replay attack prevented
        }
      }
      
      return true;
    } catch (err) {
      console.warn('QR Token verification error:', err);
      return false;
    }
  },

  // Handler for the dedicated verification endpoint (if called directly by frontend before issue)
  async verifyQrEndpoint(req: any, reply: FastifyReply): Promise<void> {
    try {
      const { qrToken, episodeId } = req.body as { qrToken: string; episodeId: string };
      if (!qrToken || !episodeId) {
        return reply.status(400).send({ success: false, error: 'Missing qrToken or episodeId' });
      }
      const isValid = await CapsuleController.verifyQrToken(qrToken, episodeId);
      reply.send({ success: isValid });
    } catch {
      reply.status(500).send({ success: false, error: 'Verification failed' });
    }
  }
};

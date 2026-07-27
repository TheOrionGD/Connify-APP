/**
 * CapsuleController — Trust Capsule issuance, redemption, and revocation using Mongoose.
 */
import type { FastifyReply } from 'fastify';
import { createHash } from 'node:crypto';
import { Capsule, Episode, Device } from '../models';
import { writeAuditLog } from '../utils/audit';
import { signToken, verifyToken } from '../services/KeyService';

interface IssueInput {
  episodeId: string;
  helperDeviceId: string;
  verificationData: {
    qrTokenHash: string;
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

      // SHARP Proximity Verification
      if (!episode.gridCellsJson) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VERIFICATION_FAILED', message: 'SHARP parameters missing on episode' },
        });
      }

      const gridCells: string[] = JSON.parse(episode.gridCellsJson);
      const isProximityMatched = gridCells.includes(input.verificationData.blindedGridCell);
      if (!isProximityMatched) {
        return reply.status(403).send({
          success: false,
          error: { code: 'PROXIMITY_VERIFICATION_FAILED', message: 'SHARP location verification check failed' },
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

      // 2. Look up by token hash (the token itself is never stored)
      const tokenHash = createHash('sha256').update(capsuleToken).digest('hex');
      const capsule = await Capsule.findOne({ signedTokenHash: tokenHash, status: 'issued' });

      if (!capsule) {
        return reply.status(404).send({
          success: false,
          error: { code: 'CAPSULE_NOT_FOUND', message: 'Capsule not found or already used' },
        });
      }

      // 3. Enforce capsule is addressed to the calling device
      if (capsule.helperDeviceId.toString() !== requestingDeviceId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'This capsule was not issued to you' },
        });
      }

      // 4. Persist redemption + activate episode
      const now = new Date();
      capsule.status = 'redeemed';
      capsule.redeemedAt = now;
      await capsule.save();

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
      const capsule = await Capsule.findById(capsuleId);

      if (!capsule) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Capsule not found' },
        });
      }
      if (capsule.status !== 'issued') {
        return reply.status(409).send({
          success: false,
          error: {
            code: 'INVALID_STATE',
            message: `Capsule in status '${capsule.status}' cannot be revoked`,
          },
        });
      }

      capsule.status = 'revoked';
      await capsule.save();

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
};

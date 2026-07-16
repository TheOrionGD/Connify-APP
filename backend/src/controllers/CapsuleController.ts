/**
 * CapsuleController — Trust Capsule issuance, redemption, and revocation.
 *
 * Key security invariants enforced here:
 *  1. Only issue a capsule for a valid, pending/matched episode.
 *  2. The capsule JWT is signed with Ed25519 (tamper-evident).
 *  3. The token hash (not the token itself) is stored in Postgres —
 *     a DB breach cannot expose replayable tokens.
 *  4. Single-use is enforced atomically via Redis SET NX —
 *     two simultaneous redemptions cannot both succeed.
 */
import type { FastifyReply } from 'fastify';
import { createHash } from 'node:crypto';
import { prisma } from '../utils/prisma';
import { writeAuditLog } from '../utils/audit';
import { signToken, verifyToken } from '../services/KeyService';
import {
  setCapsuleLock,
  deleteCapsuleLock,
} from '../services/RedisService';
import { scheduleCapsuleExpiry } from '../utils/queues';

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
const CAPSULE_TTL_SECS = CAPSULE_TTL_MS / 1000;

export const CapsuleController = {
  async issue(input: IssueInput, reply: FastifyReply): Promise<void> {
    try {
      const [episode, helperDevice] = await Promise.all([
        prisma.episode.findUnique({ where: { id: input.episodeId } }),
        prisma.device.findUnique({ where: { id: input.helperDeviceId } }),
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
          requesterId: episode.requesterDeviceId,
        },
        '2h'
      );

      // Store only the hash — the bearer token never touches the DB
      const tokenHash = createHash('sha256').update(capsuleToken).digest('hex');

      const [capsule] = await prisma.$transaction([
        prisma.capsule.create({
          data: {
            episodeId: input.episodeId,
            helperDeviceId: input.helperDeviceId,
            signedTokenHash: tokenHash,
            blindedGridCell: input.verificationData.blindedGridCell,
            status: 'issued',
            expiresAt,
          },
        }),
        prisma.episode.update({
          where: { id: input.episodeId },
          data: { status: 'matched' },
        }),
      ]);

      // Write cryptographic audit log
      writeAuditLog('CAPSULE_ISSUED', input.episodeId).catch((err) =>
        console.warn('⚠️ Failed to write audit log:', err.message)
      );

      // Schedule the BullMQ expiry sweep
      scheduleCapsuleExpiry(capsule.id, CAPSULE_TTL_MS).catch((err: Error) =>
        console.warn('⚠️  Failed to schedule capsule expiry:', err.message)
      );

      reply.status(201).send({
        success: true,
        data: {
          capsuleId: capsule.id,
          capsuleToken,   // The bearer token — client MUST keep this secret
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
      const capsule = await prisma.capsule.findFirst({
        where: { signedTokenHash: tokenHash, status: 'issued' },
      });

      if (!capsule) {
        return reply.status(404).send({
          success: false,
          error: { code: 'CAPSULE_NOT_FOUND', message: 'Capsule not found or already used' },
        });
      }

      // 3. Enforce capsule is addressed to the calling device
      if (capsule.helperDeviceId !== requestingDeviceId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'This capsule was not issued to you' },
        });
      }

      // 4. Atomic single-use lock — prevents double-spend
      const locked = await setCapsuleLock(capsule.id, CAPSULE_TTL_SECS);
      if (!locked) {
        return reply.status(409).send({
          success: false,
          error: { code: 'ALREADY_REDEEMED', message: 'This capsule has already been redeemed' },
        });
      }

      // 5. Persist redemption + activate episode
      const now = new Date();
      await prisma.$transaction([
        prisma.capsule.update({
          where: { id: capsule.id },
          data: { status: 'redeemed', redeemedAt: now },
        }),
        prisma.episode.update({
          where: { id: capsule.episodeId },
          data: { status: 'active' },
        }),
      ]);

      // Write cryptographic audit log
      writeAuditLog('CAPSULE_REDEEMED', capsule.episodeId).catch((err) =>
        console.warn('⚠️ Failed to write audit log:', err.message)
      );

      reply.status(200).send({
        success: true,
        data: {
          capsuleId: capsule.id,
          episodeId: capsule.episodeId,
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
      const capsule = await prisma.capsule.findUnique({ where: { id: capsuleId } });

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

      await prisma.capsule.update({
        where: { id: capsuleId },
        data: { status: 'revoked' },
      });

      // Write cryptographic audit log
      writeAuditLog('CAPSULE_REVOKED', capsule.episodeId).catch((err) =>
        console.warn('⚠️ Failed to write audit log:', err.message)
      );

      // Best-effort: remove any Redis lock (may not exist yet)
      deleteCapsuleLock(capsuleId).catch(() => {});

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

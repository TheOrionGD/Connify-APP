/**
 * OutcomeController — minimal outcome logging using Mongoose.
 */
import type { FastifyReply } from 'fastify';
import { Outcome, Episode, Device } from '../models';
import { writeAuditLog } from '../utils/audit';

interface CreateInput {
  episodeId: string;
  result: 'success' | 'failure' | 'SAFE_RESOLVED' | 'SUSPICIOUS_BEHAVIOR' | 'ACTIVE_THREAT';
  category: string;
  riskLevel?: number;
  completedInWindow: boolean;
}

export const OutcomeController = {
  async create(input: CreateInput, reply: FastifyReply): Promise<void> {
    try {
      const episode = await Episode.findById(input.episodeId);

      if (!episode) {
        return reply.status(404).send({
          success: false,
          error: { code: 'EPISODE_NOT_FOUND', message: 'Episode not found' },
        });
      }

      if (!['active', 'matched'].includes(episode.status)) {
        return reply.status(409).send({
          success: false,
          error: {
            code: 'INVALID_STATE',
            message: `Episode in status '${episode.status}' cannot have an outcome logged`,
          },
        });
      }

      const outcome = await Outcome.create({
        episodeId: input.episodeId,
        result: input.result,
        category: input.category,
        riskLevel: input.riskLevel,
        completedInWindow: input.completedInWindow,
      });

      episode.status = 'completed';
      await episode.save();

      // Check for suspicious or threat outcome rating to trigger auto-quarantine
      if (['SUSPICIOUS_BEHAVIOR', 'ACTIVE_THREAT'].includes(input.result)) {
        const senderDevice = await Device.findById(episode.requesterDeviceId);
        if (senderDevice) {
          senderDevice.suspiciousCount = (senderDevice.suspiciousCount || 0) + 1;
          if (senderDevice.suspiciousCount >= 2 || input.result === 'ACTIVE_THREAT') {
            senderDevice.isQuarantined = true;
          }
          await senderDevice.save();
        }
      }

      const outcomeIdStr = outcome._id.toString();

      // Write cryptographic audit log
      writeAuditLog('EPISODE_COMPLETED', input.episodeId).catch((err) =>
        console.warn('⚠️ Failed to write audit log:', err.message)
      );

      reply.status(201).send({
        success: true,
        data: {
          outcomeId: outcomeIdStr,
          episodeId: outcome.episodeId.toString(),
          result: outcome.result,
          completedInWindow: outcome.completedInWindow,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(500).send({
        success: false,
        error: { code: 'OUTCOME_CREATE_FAILED', message },
      });
    }
  },
};

/**
 * OutcomeController — minimal outcome logging.
 *
 * Records ONLY: result, category, risk level, and completion-in-window flag.
 * Deliberately stores no identity, location trail, or message content.
 * This operationalises the "minimal outcome logging" privacy principle (§8.1).
 */
import type { FastifyReply } from 'fastify';
import { prisma } from '../utils/prisma';
import { writeAuditLog } from '../utils/audit';

interface CreateInput {
  episodeId: string;
  result: 'success' | 'failure';
  category: string;
  riskLevel?: number;
  completedInWindow: boolean;
}

export const OutcomeController = {
  async create(input: CreateInput, reply: FastifyReply): Promise<void> {
    try {
      const episode = await prisma.episode.findUnique({
        where: { id: input.episodeId },
      });

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

      // Create outcome + mark episode completed in a single transaction
      const [outcome] = await prisma.$transaction([
        prisma.outcome.create({
          data: {
            episodeId: input.episodeId,
            result: input.result,
            category: input.category,
            riskLevel: input.riskLevel ?? null,
            completedInWindow: input.completedInWindow,
          },
        }),
        prisma.episode.update({
          where: { id: input.episodeId },
          data: { status: 'completed' },
        }),
      ]);

      // Write cryptographic audit log
      writeAuditLog('EPISODE_COMPLETED', input.episodeId).catch((err) =>
        console.warn('⚠️ Failed to write audit log:', err.message)
      );

      reply.status(201).send({
        success: true,
        data: {
          outcomeId: outcome.id,
          episodeId: outcome.episodeId,
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

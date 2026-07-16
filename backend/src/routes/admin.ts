import type { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';
import { createHash } from 'node:crypto';

async function verifyAuditChain() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { id: 'asc' },
  });

  let prevHash = '0';
  let isChainValid = true;
  const validations: any[] = [];

  for (const log of logs) {
    // Recompute entry hash: SHA-256(prevHash + ":" + eventType + ":" + episodeId)
    const content = `${log.prevHash}:${log.eventType}:${log.episodeId ?? ''}`;
    const calculatedHash = createHash('sha256').update(content).digest('hex');

    const matchesPrev = log.prevHash === prevHash;
    const matchesCurrent = log.entryHash === calculatedHash;
    const isValid = matchesPrev && matchesCurrent;

    if (!isValid) {
      isChainValid = false;
    }

    validations.push({
      id: log.id.toString(),
      eventType: log.eventType,
      episodeId: log.episodeId,
      prevHash: log.prevHash,
      storedHash: log.entryHash,
      calculatedHash,
      matchesPrev,
      matchesCurrent,
      isValid,
      createdAt: log.createdAt.toISOString(),
    });

    prevHash = log.entryHash;
  }

  return { isChainValid, validations };
}

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/admin/dashboard
  app.get('/dashboard', async (req, reply) => {
    try {
      const [
        totalEpisodes,
        pendingCount,
        matchedCount,
        activeCount,
        completedCount,
        outcomes,
      ] = await Promise.all([
        prisma.episode.count(),
        prisma.episode.count({ where: { status: 'pending' } }),
        prisma.episode.count({ where: { status: 'matched' } }),
        prisma.episode.count({ where: { status: 'active' } }),
        prisma.episode.count({ where: { status: 'completed' } }),
        prisma.outcome.findMany(),
      ]);

      const totalOutcomes = outcomes.length;
      const successCount = outcomes.filter((o) => o.result === 'success').length;
      const successRate = totalOutcomes > 0 ? (successCount / totalOutcomes) * 100 : 100;

      // Fetch active episodes metadata
      const activeEpisodes = await prisma.episode.findMany({
        where: { status: 'active' },
        select: {
          id: true,
          category: true,
          urgency: true,
          createdAt: true,
        },
      });

      return reply.send({
        success: true,
        data: {
          totalEpisodes,
          statusCounts: {
            pending: pendingCount,
            matched: matchedCount,
            active: activeCount,
            completed: completedCount,
          },
          successRate: Math.round(successRate * 10) / 10,
          activeEpisodes,
        },
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'DASHBOARD_FETCH_FAILED', message: error.message },
      });
    }
  });

  // GET /api/admin/audit-chain
  app.get('/audit-chain', async (req, reply) => {
    try {
      const result = await verifyAuditChain();
      return reply.send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'AUDIT_VERIFICATION_FAILED', message: error.message },
      });
    }
  });
}

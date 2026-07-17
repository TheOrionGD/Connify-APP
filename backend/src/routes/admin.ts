import type { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';
import { createHash } from 'node:crypto';
import { writeAuditLog } from '../utils/audit';

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

  // GET /api/admin/devices
  app.get('/devices', async (req, reply) => {
    try {
      const devices = await prisma.device.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return reply.send({
        success: true,
        data: devices,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'DEVICES_FETCH_FAILED', message: error.message },
      });
    }
  });

  // GET /api/admin/capsules
  app.get('/capsules', async (req, reply) => {
    try {
      const capsules = await prisma.capsule.findMany({
        orderBy: { issuedAt: 'desc' },
      });
      return reply.send({
        success: true,
        data: capsules,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'CAPSULES_FETCH_FAILED', message: error.message },
      });
    }
  });

  // GET /api/admin/outcomes
  app.get('/outcomes', async (req, reply) => {
    try {
      const outcomes = await prisma.outcome.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return reply.send({
        success: true,
        data: outcomes,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'OUTCOMES_FETCH_FAILED', message: error.message },
      });
    }
  });

  // GET /api/admin/episodes
  app.get('/episodes', async (req, reply) => {
    try {
      const episodes = await prisma.episode.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return reply.send({
        success: true,
        data: episodes,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'EPISODES_FETCH_FAILED', message: error.message },
      });
    }
  });

  // POST /api/admin/simulate/episode
  app.post('/simulate/episode', async (req, reply) => {
    try {
      // 1. Ensure a mock device exists
      let device = await prisma.device.findFirst({
        where: { deviceFingerprintHash: 'simulated-fingerprint-xyz' },
      });
      if (!device) {
        device = await prisma.device.create({
          data: {
            deviceFingerprintHash: 'simulated-fingerprint-xyz',
            publicKey: 'simulated-public-key-xyz',
            phoneHash: 'simulated-phone-hash-xyz',
          },
        });
      }

      // 2. Create the simulated episode
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min window
      const body = (req.body || {}) as any;
      const category = body.category || 'emergency';
      const urgency = Number(body.urgency) || 4;
      const latitude = Number(body.latitude) || 40.6976;
      const longitude = Number(body.longitude) || -73.9876;

      const episode = await prisma.episode.create({
        data: {
          requesterDeviceId: device.id,
          category,
          urgency,
          latitude,
          longitude,
          radiusMeters: 500,
          bchSyndromes: 'simulated-bch-syndromes',
          helperStringY: 'simulated-helper-string-y',
          gridCellsJson: JSON.stringify(['cell-a', 'cell-b']),
          expiresAt,
          status: 'active',
        },
      });

      // Update location using PostGIS raw query (catch if fails)
      await prisma.$executeRaw`
        UPDATE episodes
        SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        WHERE id = ${episode.id}::uuid
      `.catch((err) =>
        console.warn('⚠️ Proximity simulation failed ST_MakePoint:', err.message)
      );

      // Write cryptographic audit log
      await writeAuditLog('EPISODE_CREATED', episode.id);

      return reply.status(201).send({
        success: true,
        data: episode,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'SIMULATE_EPISODE_FAILED', message: error.message },
      });
    }
  });

  // POST /api/admin/simulate/checkin
  app.post('/simulate/checkin', async (req, reply) => {
    try {
      const body = (req.body || {}) as any;
      const episodeId = body.episodeId;

      let episode;
      if (episodeId) {
        episode = await prisma.episode.findUnique({
          where: { id: episodeId },
        });
      } else {
        episode = await prisma.episode.findFirst({
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!episode) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'No active episode found' },
        });
      }

      // Complete episode + outcome inside transaction
      await prisma.$transaction([
        prisma.outcome.create({
          data: {
            episodeId: episode.id,
            result: 'success',
            category: episode.category,
            riskLevel: 2,
            completedInWindow: true,
          },
        }),
        prisma.episode.update({
          where: { id: episode.id },
          data: { status: 'completed' },
        }),
      ]);

      // Write cryptographic audit log
      await writeAuditLog('EPISODE_COMPLETED', episode.id);

      return reply.send({
        success: true,
        data: { episodeId: episode.id, status: 'completed' },
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'SIMULATE_CHECKIN_FAILED', message: error.message },
      });
    }
  });

  // POST /api/admin/simulate/corrupt
  app.post('/simulate/corrupt', async (req, reply) => {
    try {
      const latestLog = await prisma.auditLog.findFirst({
        orderBy: { id: 'desc' },
      });

      if (!latestLog) {
        return reply.status(400).send({
          success: false,
          error: { code: 'NO_LOGS', message: 'No audit logs found to corrupt' },
        });
      }

      // Corrupt the hash by replacing last chars with "beef"
      const originalHash = latestLog.entryHash;
      const corruptedHash = originalHash.substring(0, originalHash.length - 4) + 'beef';

      await prisma.auditLog.update({
        where: { id: latestLog.id },
        data: { entryHash: corruptedHash },
      });

      return reply.send({
        success: true,
        data: {
          corruptedLogId: latestLog.id.toString(),
          originalHash,
          corruptedHash,
        },
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'SIMULATE_CORRUPT_FAILED', message: error.message },
      });
    }
  });

  // POST /api/admin/simulate/reset
  app.post('/simulate/reset', async (req, reply) => {
    try {
      // Heal the chain by recomputing hashes sequentially
      const logs = await prisma.auditLog.findMany({
        orderBy: { id: 'asc' },
      });

      let prevHash = '0';
      let healedCount = 0;

      for (const log of logs) {
        const content = `${prevHash}:${log.eventType}:${log.episodeId ?? ''}`;
        const calculatedHash = createHash('sha256').update(content).digest('hex');

        if (log.entryHash !== calculatedHash || log.prevHash !== prevHash) {
          await prisma.auditLog.update({
            where: { id: log.id },
            data: {
              prevHash,
              entryHash: calculatedHash,
            },
          });
          healedCount++;
        }
        prevHash = calculatedHash;
      }

      return reply.send({
        success: true,
        data: { healedCount },
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'SIMULATE_RESET_FAILED', message: error.message },
      });
    }
  });
}

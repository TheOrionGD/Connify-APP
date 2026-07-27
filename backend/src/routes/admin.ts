import type { FastifyInstance } from 'fastify';
import { createHash } from 'node:crypto';
import { Device, Episode, Capsule, Outcome, AuditLog, Profile } from '../models';
import { writeAuditLog } from '../utils/audit';

async function verifyAuditChain() {
  const logs = await AuditLog.find().sort({ createdAt: 1 });

  let prevHash = '0';
  let isChainValid = true;
  const validations: any[] = [];

  for (const log of logs) {
    const episodeIdStr = log.episodeId ? log.episodeId.toString() : '';
    const content = `${log.prevHash}:${log.eventType}:${episodeIdStr}`;
    const calculatedHash = createHash('sha256').update(content).digest('hex');

    const matchesPrev = log.prevHash === prevHash;
    const matchesCurrent = log.entryHash === calculatedHash;
    const isValid = matchesPrev && matchesCurrent;

    if (!isValid) {
      isChainValid = false;
    }

    validations.push({
      id: log._id.toString(),
      eventType: log.eventType,
      episodeId: episodeIdStr,
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
        Episode.countDocuments(),
        Episode.countDocuments({ status: 'pending' }),
        Episode.countDocuments({ status: 'matched' }),
        Episode.countDocuments({ status: 'active' }),
        Episode.countDocuments({ status: 'completed' }),
        Outcome.find(),
      ]);

      const totalOutcomes = outcomes.length;
      const successCount = outcomes.filter((o) => o.result === 'success').length;
      const successRate = totalOutcomes > 0 ? (successCount / totalOutcomes) * 100 : 100;

      const activeEpisodes = await Episode.find({ status: 'active' }).select('category urgency createdAt');

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
          activeEpisodes: activeEpisodes.map((ep) => ({
            id: ep._id.toString(),
            category: ep.category,
            urgency: ep.urgency,
            createdAt: ep.createdAt,
          })),
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
      const devices = await Device.find().sort({ createdAt: -1 });
      return reply.send({
        success: true,
        data: devices.map((d) => ({
          id: d._id.toString(),
          deviceFingerprintHash: d.deviceFingerprintHash,
          publicKey: d.publicKey,
          phoneHash: d.phoneHash,
          createdAt: d.createdAt,
          lastSeenAt: d.lastSeenAt,
        })),
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
      const capsules = await Capsule.find().sort({ issuedAt: -1 });
      return reply.send({
        success: true,
        data: capsules.map((c) => ({
          id: c._id.toString(),
          episodeId: c.episodeId.toString(),
          helperDeviceId: c.helperDeviceId.toString(),
          signedTokenHash: c.signedTokenHash,
          status: c.status,
          blindedGridCell: c.blindedGridCell,
          issuedAt: c.issuedAt,
          expiresAt: c.expiresAt,
          redeemedAt: c.redeemedAt,
        })),
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
      const outcomes = await Outcome.find().sort({ createdAt: -1 });
      return reply.send({
        success: true,
        data: outcomes.map((o) => ({
          id: o._id.toString(),
          episodeId: o.episodeId.toString(),
          result: o.result,
          category: o.category,
          riskLevel: o.riskLevel,
          completedInWindow: o.completedInWindow,
          createdAt: o.createdAt,
        })),
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
      const episodes = await Episode.find().sort({ createdAt: -1 });
      return reply.send({
        success: true,
        data: episodes.map((ep) => ({
          id: ep._id.toString(),
          requesterDeviceId: ep.requesterDeviceId.toString(),
          category: ep.category,
          urgency: ep.urgency,
          status: ep.status,
          latitude: ep.latitude,
          longitude: ep.longitude,
          radiusMeters: ep.radiusMeters,
          createdAt: ep.createdAt,
          expiresAt: ep.expiresAt,
        })),
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
      let device = await Device.findOne({ deviceFingerprintHash: 'simulated-fingerprint-xyz' });
      if (!device) {
        device = await Device.create({
          deviceFingerprintHash: 'simulated-fingerprint-xyz',
          publicKey: 'simulated-public-key-xyz',
          phoneHash: 'simulated-phone-hash-xyz',
        });
      }

      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      const body = (req.body || {}) as any;
      const category = body.category || 'emergency';
      const urgency = Number(body.urgency) || 4;
      const latitude = Number(body.latitude) || 40.6976;
      const longitude = Number(body.longitude) || -73.9876;

      const episode = await Episode.create({
        requesterDeviceId: device._id,
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
      });

      const episodeIdStr = episode._id.toString();
      await writeAuditLog('EPISODE_CREATED', episodeIdStr);

      return reply.status(201).send({
        success: true,
        data: {
          id: episodeIdStr,
          category: episode.category,
          urgency: episode.urgency,
          status: episode.status,
        },
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
        episode = await Episode.findById(episodeId);
      } else {
        episode = await Episode.findOne({ status: 'active' }).sort({ createdAt: -1 });
      }

      if (!episode) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'No active episode found' },
        });
      }

      await Outcome.create({
        episodeId: episode._id,
        result: 'success',
        category: episode.category,
        riskLevel: 2,
        completedInWindow: true,
      });

      episode.status = 'completed';
      await episode.save();

      const episodeIdStr = episode._id.toString();
      await writeAuditLog('EPISODE_COMPLETED', episodeIdStr);

      return reply.send({
        success: true,
        data: { episodeId: episodeIdStr, status: 'completed' },
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
      const latestLog = await AuditLog.findOne().sort({ createdAt: -1 });

      if (!latestLog) {
        return reply.status(400).send({
          success: false,
          error: { code: 'NO_LOGS', message: 'No audit logs found to corrupt' },
        });
      }

      const originalHash = latestLog.entryHash;
      const corruptedHash = originalHash.substring(0, originalHash.length - 4) + 'beef';

      latestLog.entryHash = corruptedHash;
      await latestLog.save();

      return reply.send({
        success: true,
        data: {
          corruptedLogId: latestLog._id.toString(),
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
      const logs = await AuditLog.find().sort({ createdAt: 1 });

      let prevHash = '0';
      let healedCount = 0;

      for (const log of logs) {
        const episodeIdStr = log.episodeId ? log.episodeId.toString() : '';
        const content = `${prevHash}:${log.eventType}:${episodeIdStr}`;
        const calculatedHash = createHash('sha256').update(content).digest('hex');

        if (log.entryHash !== calculatedHash || log.prevHash !== prevHash) {
          log.prevHash = prevHash;
          log.entryHash = calculatedHash;
          await log.save();
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

  // POST /api/admin/wipe-database
  app.post('/wipe-database', async (req, reply) => {
    try {
      await Promise.all([
        Outcome.deleteMany(),
        Capsule.deleteMany(),
        AuditLog.deleteMany(),
        Episode.deleteMany(),
        Profile.deleteMany(),
        Device.deleteMany(),
      ]);
      return reply.send({
        success: true,
        message: 'All database collections wiped successfully.',
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'WIPE_FAILED', message: error.message },
      });
    }
  });
}

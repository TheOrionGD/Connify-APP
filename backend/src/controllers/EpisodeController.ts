/**
 * EpisodeController — lifecycle management for help request episodes.
 *
 * Implements the episode state machine:
 *   pending → matched → active → completed
 *             ↓
 *          expired / cancelled
 *
 * Location is stored as flat lat/lng floats for Phase 9.
 * Phase 12 will migrate to PostGIS GEOGRAPHY(Point,4326) + GIST index
 * for true radius queries using ST_DWithin.
 */
import type { FastifyReply } from 'fastify';
import { prisma } from '../utils/prisma';
import { scheduleMatchTimeout } from '../utils/queues';

interface CreateInput {
  category: string;
  urgency: number;
  context?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  bchSyndromes: string;
  helperStringY: string;
  gridCellsJson: string;
}

interface NearbyQuery {
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

/** Episode auto-expires after 30 minutes if not resolved. */
const EPISODE_TTL_MS = 30 * 60 * 1000;
/** Episode fails to match if no helper accepts within 5 minutes. */
const MATCH_TIMEOUT_MS = 5 * 60 * 1000;

import { writeAuditLog } from '../utils/audit';

export const EpisodeController = {
  async create(
    deviceId: string,
    input: CreateInput,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + EPISODE_TTL_MS);

      const episode = await prisma.episode.create({
        data: {
          requesterDeviceId: deviceId,
          category: input.category,
          urgency: input.urgency,
          context: input.context ?? null,
          latitude: input.latitude,
          longitude: input.longitude,
          radiusMeters: input.radiusMeters,
          bchSyndromes: input.bchSyndromes,
          helperStringY: input.helperStringY,
          gridCellsJson: input.gridCellsJson,
          expiresAt,
          status: 'pending',
        },
      });

      // Set PostGIS location point from lat/lng
      await prisma.$executeRaw`
        UPDATE episodes
        SET location = ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography
        WHERE id = ${episode.id}
      `.catch((err) =>
        console.warn('⚠️ Failed to update PostGIS location:', err.message)
      );

      // Write cryptographic audit log
      writeAuditLog('EPISODE_CREATED', episode.id).catch((err) =>
        console.warn('⚠️ Failed to write audit log:', err.message)
      );

      // Schedule a BullMQ job to cancel the episode if unmatched after 5 min.
      // Non-fatal — server starts normally even if Redis is down.
      scheduleMatchTimeout(episode.id, MATCH_TIMEOUT_MS).catch((err: Error) =>
        console.warn('⚠️  Failed to schedule match timeout:', err.message)
      );

      reply.status(201).send({
        success: true,
        data: {
          id: episode.id,
          requesterDeviceId: episode.requesterDeviceId,
          category: episode.category,
          urgency: episode.urgency,
          status: episode.status,
          latitude: episode.latitude,
          longitude: episode.longitude,
          radiusMeters: episode.radiusMeters,
          createdAt: episode.createdAt.toISOString(),
          expiresAt: episode.expiresAt.toISOString(),
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(500).send({
        success: false,
        error: { code: 'EPISODE_CREATE_FAILED', message },
      });
    }
  },

  async getById(episodeId: string, reply: FastifyReply): Promise<void> {
    try {
      const episode = await prisma.episode.findUnique({
        where: { id: episodeId },
        select: {
          id: true,
          category: true,
          urgency: true,
          status: true,
          radiusMeters: true,
          expiresAt: true,
          createdAt: true,
          bchSyndromes: true,
          helperStringY: true,
          // Selective disclosure — requesterDeviceId and exact location
          // are intentionally excluded from this view.
        },
      });

      if (!episode) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Episode not found' },
        });
      }

      reply.status(200).send({ success: true, data: episode });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(500).send({
        success: false,
        error: { code: 'EPISODE_FETCH_FAILED', message },
      });
    }
  },

  async cancel(
    episodeId: string,
    deviceId: string,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const episode = await prisma.episode.findUnique({ where: { id: episodeId } });

      if (!episode) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Episode not found' },
        });
      }
      if (episode.requesterDeviceId !== deviceId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You are not the owner of this episode' },
        });
      }
      if (!['pending', 'matched'].includes(episode.status)) {
        return reply.status(409).send({
          success: false,
          error: {
            code: 'INVALID_STATE',
            message: `Episode in status '${episode.status}' cannot be cancelled`,
          },
        });
      }

      await prisma.episode.update({
        where: { id: episodeId },
        data: { status: 'cancelled' },
      });

      // Write cryptographic audit log
      writeAuditLog('EPISODE_CANCELLED', episodeId).catch((err) =>
        console.warn('⚠️ Failed to write audit log:', err.message)
      );

      reply.status(200).send({
        success: true,
        data: { episodeId, status: 'cancelled' },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(500).send({
        success: false,
        error: { code: 'CANCEL_FAILED', message },
      });
    }
  },

  /**
   * Returns nearby pending episodes filtered by PostGIS ST_DWithin geography query.
   * Applies selective disclosure — only category, urgency, and radius
   * are returned. No requester identity or exact coordinates.
   */
  async getNearby(query: NearbyQuery, reply: FastifyReply): Promise<void> {
    try {
      const episodes = await prisma.$queryRaw<any[]>`
        SELECT 
          id, 
          category, 
          urgency, 
          status, 
          radius_meters AS "radiusMeters", 
          created_at AS "createdAt",
          ROUND(
            ST_Distance(
              location,
              ST_SetSRID(ST_MakePoint(${query.longitude}, ${query.latitude}), 4326)::geography
            )::numeric, 0
          ) AS "distanceMeters"
        FROM episodes
        WHERE status = 'pending'
          AND expires_at > NOW()
          AND ST_DWithin(
            location, 
            ST_SetSRID(ST_MakePoint(${query.longitude}, ${query.latitude}), 4326)::geography, 
            ${query.radiusMeters}
          )
        ORDER BY urgency DESC
        LIMIT 20
      `;

      reply.status(200).send({ success: true, data: episodes });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(500).send({
        success: false,
        error: { code: 'NEARBY_FETCH_FAILED', message },
      });
    }
  },
};

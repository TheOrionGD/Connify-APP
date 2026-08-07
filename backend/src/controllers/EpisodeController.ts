/**
 * EpisodeController — lifecycle management for help request episodes using Mongoose.
 */
import type { FastifyReply } from 'fastify';
import { Episode } from '../models';
import { writeAuditLog } from '../utils/audit';
import { broadcastNewEpisode } from '../sockets';

interface CreateInput {
  category: string;
  urgency: number;
  context?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  blindedGridSigs: string;
  helperValidationKey: string;
  gridCellsJson: string;
}

interface NearbyQuery {
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

/** Episode auto-expires after 30 minutes if not resolved. */
const EPISODE_TTL_MS = 30 * 60 * 1000;

export const EpisodeController = {
  async create(
    deviceId: string,
    input: CreateInput,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + EPISODE_TTL_MS);

      const episode = await Episode.create({
        requesterDeviceId: deviceId,
        category: input.category,
        urgency: input.urgency,
        latitude: input.latitude,
        longitude: input.longitude,
        location: {
          type: 'Point',
          coordinates: [input.longitude, input.latitude],
        },
        radiusMeters: input.radiusMeters,
        blindedGridSigs: input.blindedGridSigs,
        helperValidationKey: input.helperValidationKey,
        gridCellsJson: input.gridCellsJson,
        expiresAt,
        status: 'pending',
      });

      const episodeIdStr = episode._id.toString();

      // Write cryptographic audit log
      writeAuditLog('EPISODE_CREATED', episodeIdStr).catch((err) =>
        console.warn('⚠️ Failed to write audit log:', err.message)
      );

      const responseData = {
        id: episodeIdStr,
        requesterDeviceId: episode.requesterDeviceId.toString(),
        category: episode.category,
        urgency: episode.urgency,
        status: episode.status,
        latitude: episode.latitude,
        longitude: episode.longitude,
        radiusMeters: episode.radiusMeters,
        createdAt: episode.createdAt.toISOString(),
        expiresAt: episode.expiresAt.toISOString(),
      };

      // Broadcast to live feed
      broadcastNewEpisode(responseData);

      reply.status(201).send({
        success: true,
        data: responseData,
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
      const episode = await Episode.findById(episodeId);

      if (!episode) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Episode not found' },
        });
      }

      reply.status(200).send({
        success: true,
        data: {
          id: episode._id.toString(),
          category: episode.category,
          urgency: episode.urgency,
          status: episode.status,
          radiusMeters: episode.radiusMeters,
          expiresAt: episode.expiresAt.toISOString(),
          createdAt: episode.createdAt.toISOString(),
          blindedGridSigs: episode.blindedGridSigs,
          helperValidationKey: episode.helperValidationKey,
        },
      });
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
      const episode = await Episode.findById(episodeId);

      if (!episode) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Episode not found' },
        });
      }
      if (episode.requesterDeviceId.toString() !== deviceId) {
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

      episode.status = 'cancelled';
      await episode.save();

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

  async getNearby(query: NearbyQuery, reply: FastifyReply): Promise<void> {
    try {
      const searchRadius = Math.max(query.radiusMeters || 500, 10000); // minimum 10km search window for reliable discovery

      const nearbyEpisodes = await Episode.find({
        status: { $in: ['pending', 'active'] },
        expiresAt: { $gt: new Date() },
        location: {
          $geoWithin: { $centerSphere: [[query.longitude, query.latitude], searchRadius / 6378100] },
        },
      }).sort({ urgency: -1, createdAt: -1 }).limit(50);

      const formattedEpisodes = nearbyEpisodes.map((ep) => {
        // Calculate precise distance for the frontend display
        const R = 6371e3;
        const φ1 = (query.latitude * Math.PI) / 180;
        const φ2 = (ep.latitude * Math.PI) / 180;
        const Δφ = ((ep.latitude - query.latitude) * Math.PI) / 180;
        const Δλ = ((ep.longitude - query.longitude) * Math.PI) / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceMeters = Math.round(R * c);

        return {
          id: ep._id.toString(),
          category: ep.category,
          urgency: ep.urgency,
          status: ep.status,
          radiusMeters: ep.radiusMeters,
          createdAt: ep.createdAt.toISOString(),
          distanceMeters,
        };
      });

      reply.status(200).send({ success: true, data: formattedEpisodes });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(500).send({
        success: false,
        error: { code: 'NEARBY_FETCH_FAILED', message },
      });
    }
  },
};

import type { FastifyReply } from 'fastify';
import { Guardian } from '../models';
import { LocationWatchdogService, LocationPingInput } from '../services/LocationWatchdogService';

interface GuardianInput {
  userFullName: string;
  fullName: string;
  phone: string;
  relationship: string;
}

export const LocationController = {
  async pingLocation(deviceId: string, body: LocationPingInput, reply: FastifyReply): Promise<void> {
    try {
      const location = await LocationWatchdogService.updateLocationPing(deviceId, body);
      reply.status(200).send({
        success: true,
        data: {
          updated: true,
          latitude: location.latitude,
          longitude: location.longitude,
          lastPingAt: location.lastPingAt.toISOString(),
          signalLostAlertSent: location.signalLostAlertSent,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(400).send({
        success: false,
        error: { code: 'LOCATION_PING_FAILED', message },
      });
    }
  },

  async createGuardian(deviceId: string, body: GuardianInput, reply: FastifyReply): Promise<void> {
    try {
      if (!body.userFullName || !body.fullName || !body.phone || !body.relationship) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'userFullName, fullName, phone, and relationship are mandatory' },
        });
      }

      const guardian = await Guardian.create({
        deviceId,
        userFullName: body.userFullName,
        fullName: body.fullName,
        phone: body.phone,
        relationship: body.relationship,
      });

      reply.status(201).send({
        success: true,
        data: {
          id: guardian._id.toString(),
          userFullName: guardian.userFullName,
          fullName: guardian.fullName,
          phone: guardian.phone,
          relationship: guardian.relationship,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(500).send({
        success: false,
        error: { code: 'GUARDIAN_CREATE_FAILED', message },
      });
    }
  },

  async triggerWatchdogScan(reply: FastifyReply): Promise<void> {
    try {
      const alertsSent = await LocationWatchdogService.checkSignalLossAndNotifyGuardians();
      reply.status(200).send({
        success: true,
        alertsSent,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      reply.status(500).send({
        success: false,
        error: { code: 'WATCHDOG_SCAN_FAILED', message },
      });
    }
  },
};

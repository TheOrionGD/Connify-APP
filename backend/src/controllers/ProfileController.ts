import type { FastifyReply } from 'fastify';
import { prisma } from '../utils/prisma';

export const ProfileController = {
  async upsertProfile(
    data: {
      firstName: string;
      lastName: string;
      phone?: string;
      medicalNotes?: string;
    },
    deviceId: string,
    reply: FastifyReply
  ) {
    try {
      const profile = await prisma.profile.upsert({
        where: { deviceId },
        update: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          medicalNotes: data.medicalNotes || null,
        },
        create: {
          deviceId,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          medicalNotes: data.medicalNotes || null,
        },
      });

      return reply.status(200).send({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error('Failed to upsert profile:', error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update profile' },
      });
    }
  },
};

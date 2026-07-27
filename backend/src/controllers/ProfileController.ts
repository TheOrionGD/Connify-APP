import type { FastifyReply } from 'fastify';
import { Profile } from '../models';

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
      let profile = await Profile.findOne({ deviceId });
      if (profile) {
        profile.firstName = data.firstName;
        profile.lastName = data.lastName;
        profile.phone = data.phone;
        profile.medicalNotes = data.medicalNotes;
        profile.updatedAt = new Date();
        await profile.save();
      } else {
        profile = await Profile.create({
          deviceId,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          medicalNotes: data.medicalNotes,
          updatedAt: new Date(),
        });
      }

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

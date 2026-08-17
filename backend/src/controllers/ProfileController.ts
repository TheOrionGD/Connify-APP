import type { FastifyReply } from 'fastify';
import { Profile, Guardian } from '../models';
import { writeAuditLog } from '../utils/audit.js';

export const ProfileController = {
  async upsertProfile(
    data: {
      firstName: string;
      lastName: string;
      phone?: string;
      medicalNotes?: string;
      firebaseUid?: string;
      email?: string;
      isAnonymous?: boolean;
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
        if (data.firebaseUid !== undefined) profile.firebaseUid = data.firebaseUid;
        if (data.email !== undefined) profile.email = data.email;
        if (data.isAnonymous !== undefined) profile.isAnonymous = data.isAnonymous;
        profile.updatedAt = new Date();
        await profile.save();
      } else {
        profile = await Profile.create({
          deviceId,
          firebaseUid: data.firebaseUid,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          isAnonymous: data.isAnonymous !== undefined ? data.isAnonymous : true,
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

  async getProfile(deviceId: string, reply: FastifyReply) {
    try {
      const profile = await Profile.findOne({ deviceId });
      if (!profile) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Profile not found for this device' },
        });
      }

      return reply.status(200).send({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error('Failed to get profile:', error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch profile' },
      });
    }
  },

  async upgradeProfile(
    data: {
      firebaseUid?: string;
      firstName: string;
      lastName: string;
      phone: string;
      email?: string;
      guardian: {
        fullName: string;
        phone: string;
        relationship: string;
        email?: string;
        fcmToken?: string;
      };
    },
    deviceId: string,
    reply: FastifyReply
  ) {
    try {
      if (!data.firstName || !data.lastName || !data.phone || !data.guardian?.fullName || !data.guardian?.phone || !data.guardian?.relationship) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'firstName, lastName, phone, and mandatory guardian details (fullName, phone, relationship) are required',
          },
        });
      }

      // 1. Upgrade Profile in MongoDB (mark isAnonymous = false)
      let profile = await Profile.findOne({ deviceId });
      if (profile) {
        profile.firebaseUid = data.firebaseUid || profile.firebaseUid;
        profile.firstName = data.firstName;
        profile.lastName = data.lastName;
        profile.phone = data.phone;
        profile.email = data.email || profile.email;
        profile.isAnonymous = false;
        profile.updatedAt = new Date();
        await profile.save();
      } else {
        profile = await Profile.create({
          deviceId,
          firebaseUid: data.firebaseUid,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          isAnonymous: false,
          updatedAt: new Date(),
        });
      }

      // 2. Register / Update Mandatory Guardian bound to deviceId
      const userFullName = `${data.firstName} ${data.lastName}`.trim();
      const guardian = await Guardian.findOneAndUpdate(
        { deviceId },
        {
          $set: {
            deviceId,
            userFullName,
            fullName: data.guardian.fullName,
            phone: data.guardian.phone,
            relationship: data.guardian.relationship,
            ...(data.guardian.email && { email: data.guardian.email }),
            ...(data.guardian.fcmToken && { fcmToken: data.guardian.fcmToken }),
          },
        },
        { upsert: true, new: true }
      );

      await writeAuditLog('PROFILE_MIGRATED_FROM_ANONYMOUS', deviceId);

      return reply.status(200).send({
        success: true,
        data: {
          profile,
          guardian,
          message: 'Profile upgraded successfully from Anonymous to Registered user.',
        },
      });
    } catch (error) {
      console.error('Failed to upgrade profile:', error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upgrade profile' },
      });
    }
  },
};

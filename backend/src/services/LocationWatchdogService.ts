import { DeviceLocation, Guardian, Profile } from '../models';
import { writeAuditLog } from '../utils/audit';
import { env } from '../config/env';

export interface LocationPingInput {
  latitude: number;
  longitude: number;
  accuracy?: number;
  batteryLevel?: number;
}

// Remove SMS log store, replace with Brevo and FCM
import { getMessaging } from 'firebase-admin/messaging';

export interface DispatchRecord {
  to: string;
  type: 'SIGNAL_LOSS' | 'SIGNAL_RECOVERED';
  channel: 'EMAIL' | 'FCM';
  timestamp: Date;
}

export const dispatchedAlertsLog: DispatchRecord[] = [];

export class LocationWatchdogService {
  /**
   * Asserts that at least 1 mandatory guardian is registered for the device.
   * Throws GUARDIAN_REQUIRED error if missing.
   */
  public static async assertMandatoryGuardian(deviceId: string): Promise<void> {
    const count = await Guardian.countDocuments({ deviceId });
    if (count === 0) {
      throw new Error('GUARDIAN_REQUIRED: Mandatory guardian registration missing. Register at least 1 emergency guardian before creating an episode.');
    }
  }

  /**
   * Atomically updates location in database AFTER receiving new payload.
   * Replaces prior location record (1-point sliding window) and triggers recovery SMS if signal was previously lost.
   */
  public static async updateLocationPing(deviceId: string, input: LocationPingInput) {
    if (input.latitude === 0 && input.longitude === 0) {
      throw new Error('INVALID_LOCATION: Latitude and longitude cannot both be 0');
    }

    const existingLoc = await DeviceLocation.findOne({ deviceId });
    const wasSignalLost = existingLoc?.signalLostAlertSent || false;

    // Atomic overwrite after receiving confirmed location payload
    const updatedLocation = await DeviceLocation.findOneAndUpdate(
      { deviceId },
      {
        $set: {
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
          batteryLevel: input.batteryLevel,
          isActiveSession: true,
          signalLostAlertSent: false, // Reset signal loss alert state
          retryCount: 0,
          lastPingAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // If signal was previously lost and is now recovered, dispatch Signal Recovered Alerts
    if (wasSignalLost) {
      await this.dispatchSignalRecoveredAlerts(deviceId);
    }

    return updatedLocation;
  }

  /**
   * Watchdog scanner: Checks for devices in active sessions where no ping has been received for >= 15 seconds.
   */
  public static async checkSignalLossAndNotifyGuardians(): Promise<number> {
    const SIGNAL_LOSS_THRESHOLD_MS = 15 * 1000;
    const cutoffTime = new Date(Date.now() - SIGNAL_LOSS_THRESHOLD_MS);

    const timedOutDevices = await DeviceLocation.find({
      isActiveSession: true,
      signalLostAlertSent: false,
      lastPingAt: { $lt: cutoffTime },
    });

    let alertCount = 0;

    for (const loc of timedOutDevices) {
      loc.signalLostAlertSent = true;
      loc.retryCount = (loc.retryCount || 0) + 1;
      await loc.save();

      await this.dispatchSignalLossAlerts(
        loc.deviceId.toString(),
        loc.retryCount
      );

      alertCount++;
    }

    return alertCount;
  }

  /**
   * Helper: Dispatches Brevo Email and FCM Push to guardians on Signal Loss.
   */
  private static async dispatchSignalLossAlerts(
    deviceId: string,
    _retryNum: number
  ): Promise<void> {
    const dbLocation = await DeviceLocation.findOne({ deviceId });
    if (!dbLocation) return;

    const profile = await Profile.findOne({ deviceId });
    const guardians = await Guardian.find({ deviceId });

    const userFullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : 'User';
    const latitude = dbLocation.latitude;
    const longitude = dbLocation.longitude;
    const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

    for (const g of guardians) {
      const relationshipStr = g.relationship || 'contact';
      const subject = `EMERGENCY ALERT: Signal Lost for ${userFullName}`;
      const message = `Signal/GPS lost for your ${relationshipStr}, ${userFullName}, during an active emergency session (Reason: Device powered off, Airplane mode, or out of signal range for >= 15 seconds).\n\nLast known coordinates: Lat ${latitude}, Lng ${longitude}.\n\nView on map: ${mapUrl}`;

      // 1. Send Push Notification (FCM)
      if (g.fcmToken) {
        try {
          await getMessaging().send({
            token: g.fcmToken,
            notification: {
              title: subject,
              body: message,
            },
          });
          dispatchedAlertsLog.push({ to: g.fcmToken, type: 'SIGNAL_LOSS', channel: 'FCM', timestamp: new Date() });
          console.log(`🔔 FCM Push Sent to ${g.fullName}`);
        } catch (err: any) {
          console.error(`❌ FCM Push failed for ${g.fullName}:`, err.message);
        }
      }

      // 2. Send Email (Brevo)
      if (g.email && env.BREVO_API_KEY) {
        try {
          const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'api-key': env.BREVO_API_KEY,
            },
            body: JSON.stringify({
              sender: { name: 'Connify Watchdog', email: 'alerts@connify.app' },
              to: [{ email: g.email, name: g.fullName }],
              subject: subject,
              htmlContent: `<p>${message.replace(/\\n/g, '<br>')}</p>`,
            }),
          });
          if (response.ok) {
            dispatchedAlertsLog.push({ to: g.email, type: 'SIGNAL_LOSS', channel: 'EMAIL', timestamp: new Date() });
            console.log(`📧 Brevo Email Sent to ${g.email}`);
          } else {
            console.error(`❌ Brevo Email failed for ${g.email}:`, await response.text());
          }
        } catch (err: any) {
          console.error(`❌ Brevo Email error for ${g.email}:`, err.message);
        }
      } else {
        // Fallback log if missing email or key
        console.log(`⚠️ Email omitted for ${g.fullName} - Missing email or BREVO_API_KEY`);
      }
    }

    await writeAuditLog('GUARDIAN_SIGNAL_LOSS_ALERTS_DISPATCHED', deviceId);
  }

  /**
   * Helper: Dispatches Brevo Email and FCM Push to guardians on Signal Recovery.
   */
  private static async dispatchSignalRecoveredAlerts(deviceId: string): Promise<void> {
    const dbLocation = await DeviceLocation.findOne({ deviceId });
    if (!dbLocation) return;

    const profile = await Profile.findOne({ deviceId });
    const guardians = await Guardian.find({ deviceId });

    const userFullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : 'User';
    const latitude = dbLocation.latitude;
    const longitude = dbLocation.longitude;
    const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

    for (const g of guardians) {
      const relationshipStr = g.relationship || 'contact';
      const subject = `SAFETY UPDATE: Signal Recovered for ${userFullName}`;
      const message = `Signal/GPS has been RE-ESTABLISHED for your ${relationshipStr}, ${userFullName} (Device powered back on / Signal restored). Live tracking active.\n\nUpdated coordinates: Lat ${latitude}, Lng ${longitude}.\n\nView on map: ${mapUrl}`;

      // 1. Send Push Notification (FCM)
      if (g.fcmToken) {
        try {
          await getMessaging().send({
            token: g.fcmToken,
            notification: {
              title: subject,
              body: message,
            },
          });
          dispatchedAlertsLog.push({ to: g.fcmToken, type: 'SIGNAL_RECOVERED', channel: 'FCM', timestamp: new Date() });
          console.log(`🔔 FCM Recovery Push Sent to ${g.fullName}`);
        } catch (err: any) {
          console.error(`❌ FCM Recovery Push failed for ${g.fullName}:`, err.message);
        }
      }

      // 2. Send Email (Brevo)
      if (g.email && env.BREVO_API_KEY) {
        try {
          const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'api-key': env.BREVO_API_KEY,
            },
            body: JSON.stringify({
              sender: { name: 'Connify Watchdog', email: 'alerts@connify.app' },
              to: [{ email: g.email, name: g.fullName }],
              subject: subject,
              htmlContent: `<p>${message.replace(/\\n/g, '<br>')}</p>`,
            }),
          });
          if (response.ok) {
            dispatchedAlertsLog.push({ to: g.email, type: 'SIGNAL_RECOVERED', channel: 'EMAIL', timestamp: new Date() });
            console.log(`📧 Brevo Recovery Email Sent to ${g.email}`);
          }
        } catch (err: any) {
          console.error(`❌ Brevo Recovery Email error for ${g.email}:`, err.message);
        }
      }
    }

    await writeAuditLog('GUARDIAN_SIGNAL_RECOVERED_ALERTS_DISPATCHED', deviceId);
  }
}

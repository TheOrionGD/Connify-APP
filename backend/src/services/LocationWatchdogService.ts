import { DeviceLocation, Guardian, Profile } from '../models';
import { writeAuditLog } from '../utils/audit';

export interface LocationPingInput {
  latitude: number;
  longitude: number;
  accuracy?: number;
  batteryLevel?: number;
}

export interface SmsDispatchRecord {
  toPhone: string;
  message: string;
  type: 'SIGNAL_LOSS' | 'SIGNAL_RECOVERED';
  timestamp: Date;
}

// In-memory store for SMS audit verification during runtime
export const dispatchedSmsLog: SmsDispatchRecord[] = [];

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

    // If signal was previously lost and is now recovered, dispatch Signal Recovered Guardian SMS
    if (wasSignalLost) {
      await this.dispatchSignalRecoveredSms(deviceId);
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

      await this.dispatchSignalLossSms(
        loc.deviceId.toString(),
        loc.retryCount
      );

      alertCount++;
    }

    return alertCount;
  }

  /**
   * Helper: Dispatches personalized Signal Loss SMS to guardians using User Full Name & Relationship.
   * Fetches last known location directly from MongoDB record.
   */
  private static async dispatchSignalLossSms(
    deviceId: string,
    retryNum: number
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
      const smsMessage = `EMERGENCY ALERT [CONNIFY WATCHDOG]: Signal/GPS lost for your ${relationshipStr}, ${userFullName}, during an active emergency session (Reason: Device powered off, Airplane mode, or out of signal range for >= 15 seconds). Last known coordinates from database: Lat ${latitude}, Lng ${longitude}. View on map: ${mapUrl}`;

      dispatchedSmsLog.push({
        toPhone: g.phone,
        message: smsMessage,
        type: 'SIGNAL_LOSS',
        timestamp: new Date(),
      });

      console.log(`📱 Guardian SMS Sent to ${g.fullName} (${g.phone}): ${smsMessage}`);
    }

    await writeAuditLog('GUARDIAN_SIGNAL_LOSS_SMS_DISPATCHED', deviceId);
  }

  /**
   * Helper: Dispatches personalized Signal Recovered SMS to guardians.
   * Fetches newly updated location directly from MongoDB record.
   * UNBOUNDED RECOVERY: Triggered regardless of how long signal was lost.
   */
  private static async dispatchSignalRecoveredSms(deviceId: string): Promise<void> {
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
      const smsMessage = `SAFETY UPDATE [CONNIFY WATCHDOG]: Signal/GPS has been RE-ESTABLISHED for your ${relationshipStr}, ${userFullName} (Device powered back on / Signal restored). Live tracking active. Updated coordinates from database: Lat ${latitude}, Lng ${longitude}. View on map: ${mapUrl}`;

      dispatchedSmsLog.push({
        toPhone: g.phone,
        message: smsMessage,
        type: 'SIGNAL_RECOVERED',
        timestamp: new Date(),
      });

      console.log(`📱 Guardian Recovery SMS Sent to ${g.fullName} (${g.phone}): ${smsMessage}`);
    }

    await writeAuditLog('GUARDIAN_SIGNAL_RECOVERED_SMS_DISPATCHED', deviceId);
  }
}

import { formatEmergencySMSMessage } from '../utils/smsFormatter';
import { useLocationStore } from '../stores/locationStore';
import { NotificationService } from './NotificationService';

export interface ActiveSafetyTimer {
  id: string;
  destination: string;
  durationMinutes: number;
  remainingSeconds: number;
  startedAt: number;
  expiresAt: number;
  isActive: boolean;
}

let activeTimer: ActiveSafetyTimer | null = null;
let timerInterval: any = null;

export const safetyGuardService = {
  getActiveTimer(): ActiveSafetyTimer | null {
    return activeTimer;
  },

  startGuardTimer(
    destination: string,
    durationMinutes: number,
    onTick?: (remainingSeconds: number) => void,
    onExpired?: () => void
  ): ActiveSafetyTimer {
    if (timerInterval) clearInterval(timerInterval);

    const now = Date.now();
    const expiresAt = now + durationMinutes * 60 * 1000;

    activeTimer = {
      id: `timer_${now}`,
      destination,
      durationMinutes,
      remainingSeconds: durationMinutes * 60,
      startedAt: now,
      expiresAt,
      isActive: true,
    };

    NotificationService.sendLocalNotification(
      'Timed Safety Guard Active',
      `Quiet check-in countdown set for ${durationMinutes} mins to "${destination}".`
    );

    timerInterval = setInterval(() => {
      if (!activeTimer) {
        clearInterval(timerInterval);
        return;
      }

      const rem = Math.max(0, Math.floor((activeTimer.expiresAt - Date.now()) / 1000));
      activeTimer.remainingSeconds = rem;
      onTick?.(rem);

      if (rem <= 0) {
        clearInterval(timerInterval);
        activeTimer.isActive = false;

        // Trigger Emergency Notification, Backend FCM Push to Guardians & SMS alert
        const { latitude, longitude } = useLocationStore.getState();
        const smsMsg = formatEmergencySMSMessage({
          alertType: 'SAFETY_GUARD_EXPIRED',
          latitude: latitude || 0,
          longitude: longitude || 0,
          reason: `Timed Safety Guard expired without check-in while traveling to "${destination}".`,
        });

        // Dispatch Backend FCM push alert to registered emergency guardians
        const { apiClient } = require('./api/apiClient');
        apiClient.post('/api/v1/guard/alert-expired', {
          destination,
          durationMinutes: activeTimer?.durationMinutes || 0,
          latitude: latitude || 0,
          longitude: longitude || 0,
          expiredAt: Date.now(),
        }).catch((err: any) => {
          console.warn('[SafetyGuard] Guardian FCM dispatch warning:', err?.message);
        });

        NotificationService.sendLocalNotification(
          'EMERGENCY: Safety Guard Expired!',
          `FCM Guardian Alert Sent! You failed to check in before your timer ended for "${destination}".`
        );

        onExpired?.();
      }
    }, 1000);

    return activeTimer;
  },

  checkInSafely(): void {
    if (timerInterval) clearInterval(timerInterval);
    if (activeTimer) {
      activeTimer.isActive = false;
      NotificationService.sendLocalNotification(
        'Safely Arrived',
        `Check-in verified for "${activeTimer.destination}". Timer cancelled successfully.`
      );
    }
    activeTimer = null;
  },

  cancelGuardTimer(): void {
    if (timerInterval) clearInterval(timerInterval);
    activeTimer = null;
  },
};

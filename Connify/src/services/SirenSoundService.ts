import { Vibration, Platform } from 'react-native';
import { useEpisodeStore } from '../stores/episodeStore';
import { NotificationService } from './NotificationService';
import { socketService } from './socketService';
import { useLocationStore } from '../stores/locationStore';
import { useAuthStore } from '../stores/authStore';

/**
 * SirenSoundService
 * High-pitched emergency siren sound synthesizer & dual-tone siren oscillator
 * Combined with continuous haptic vibration and auto-SOS dispatch.
 */
class SirenSoundService {
  private active: boolean = false;
  private vibrationInterval: any = null;
  private audioCtx: any = null;
  private oscillator1: any = null;
  private oscillator2: any = null;
  private gainNode: any = null;
  private sirenSweepTimer: any = null;

  /**
   * Start Loud Emergency Siren Alarm
   * Plays high-frequency sweeping audio, continuous vibration, and dispatches emergency SOS
   */
  public startSiren(): void {
    if (this.active) return;
    this.active = true;

    // 1. Start continuous high-frequency vibration pattern
    try {
      if (Platform.OS !== 'web') {
        // Vibrate pattern: 0ms delay, 500ms vibrate, 200ms pause, 500ms vibrate
        Vibration.vibrate([0, 500, 200, 500], true);
      } else {
        this.vibrationInterval = setInterval(() => {
          if ('vibrate' in navigator) {
            (navigator as any).vibrate([500, 200, 500]);
          }
        }, 1200);
      }
    } catch (e) {
      console.warn('[SirenSoundService] Vibration error:', e);
    }

    // 2. Synthesize High-Pitched Dual-Tone Siren Sound (850Hz - 1200Hz sweep)
    try {
      const g = globalThis as any;
      const AudioContextClass = g.AudioContext || g.webkitAudioContext;

      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.oscillator1 = this.audioCtx.createOscillator();
        this.oscillator2 = this.audioCtx.createOscillator();
        this.gainNode = this.audioCtx.createGain();

        this.oscillator1.type = 'sawtooth';
        this.oscillator2.type = 'sine';

        this.oscillator1.frequency.setValueAtTime(900, this.audioCtx.currentTime);
        this.oscillator2.frequency.setValueAtTime(1100, this.audioCtx.currentTime);

        this.gainNode.gain.setValueAtTime(0.9, this.audioCtx.currentTime);

        this.oscillator1.connect(this.gainNode);
        this.oscillator2.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);

        this.oscillator1.start();
        this.oscillator2.start();

        // Oscillate frequency to simulate loud dual-pitch emergency siren
        let high = true;
        this.sirenSweepTimer = setInterval(() => {
          if (!this.audioCtx || !this.oscillator1 || !this.oscillator2) return;
          const targetFreq1 = high ? 1200 : 850;
          const targetFreq2 = high ? 1350 : 950;
          this.oscillator1.frequency.exponentialRampToValueAtTime(
            targetFreq1,
            this.audioCtx.currentTime + 0.25
          );
          this.oscillator2.frequency.exponentialRampToValueAtTime(
            targetFreq2,
            this.audioCtx.currentTime + 0.25
          );
          high = !high;
        }, 350);
      }
    } catch (err) {
      console.warn('[SirenSoundService] Audio synthesis error:', err);
    }

    // 3. Dispatch Automatic Emergency Request to Surrounding Responders
    this.dispatchAutomaticEmergencySOS();
  }

  /**
   * Stop Siren Sound & Vibration
   */
  public stopSiren(): void {
    this.active = false;

    // Stop vibration
    try {
      if (Platform.OS !== 'web') {
        Vibration.cancel();
      } else if (this.vibrationInterval) {
        clearInterval(this.vibrationInterval);
        this.vibrationInterval = null;
      }
    } catch (e) {
      console.warn('[SirenSoundService] Stop vibration error:', e);
    }

    // Stop Audio Synthesizer
    if (this.sirenSweepTimer) {
      clearInterval(this.sirenSweepTimer);
      this.sirenSweepTimer = null;
    }

    try {
      if (this.oscillator1) {
        this.oscillator1.stop();
        this.oscillator1.disconnect();
        this.oscillator1 = null;
      }
      if (this.oscillator2) {
        this.oscillator2.stop();
        this.oscillator2.disconnect();
        this.oscillator2 = null;
      }
      if (this.audioCtx) {
        this.audioCtx.close();
        this.audioCtx = null;
      }
    } catch (e) {
      console.warn('[SirenSoundService] Audio cleanup error:', e);
    }
  }

  /**
   * Returns current siren status
   */
  public isSirenActive(): boolean {
    return this.active;
  }

  /**
   * Automatic Emergency Request dispatch to surrounding radius responders
   */
  private async dispatchAutomaticEmergencySOS(): Promise<void> {
    try {
      const locationState = useLocationStore.getState();
      const lat = locationState.latitude || 0;
      const lng = locationState.longitude || 0;

      const userProfile = useAuthStore.getState().userProfile;
      const userName = userProfile
        ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
        : 'Safety User';

      // 1. Update Episode Store with active Women Safety SOS
      useEpisodeStore.getState().startRequest(
        'Women Safety & Harassment',
        5, // Urgency 5 - Critical Emergency
        `LOUD SIREN PANIC ALARM ACTIVATED by ${userName}. Immediate surrounding responder intervention requested.`,
        lat,
        lng
      );

      // 2. Dispatch Local Notification
      await NotificationService.notifyRequestCreated('Women Safety SOS & Loud Siren Alarm');

      // 3. Emit real-time Socket/MQTT broadcast to nearby responder radius
      if (socketService.isConnected()) {
        const currentEpId = useEpisodeStore.getState().episodeId;
        if (currentEpId) {
          socketService.updateResponderLocation(currentEpId, lat, lng);
        }
      }
    } catch (err) {
      console.warn('[SirenSoundService] Auto SOS dispatch error:', err);
    }
  }
}

export const sirenSoundService = new SirenSoundService();

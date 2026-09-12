import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface InAppNotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type?: 'emergency' | 'responder' | 'guard' | 'chat' | 'system' | 'general';
  data?: any;
}

type NotificationListener = (notifications: InAppNotificationItem[]) => void;

const NOTIF_STORAGE_KEY = 'CONNIFY_IN_APP_NOTIFICATIONS';

export class NotificationService {
  private static channelId: string | null = null;
  private static listeners: Set<NotificationListener> = new Set();
  private static cachedNotifications: InAppNotificationItem[] | null = null;

  public static subscribeInAppNotifications(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    this.getInAppNotifications().then((list) => listener(list)).catch(() => null);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(list: InAppNotificationItem[]) {
    this.cachedNotifications = list;
    this.listeners.forEach((listener) => {
      try {
        listener(list);
      } catch (err) {
        console.warn('Listener error:', err);
      }
    });
  }

  public static async getInAppNotifications(): Promise<InAppNotificationItem[]> {
    if (this.cachedNotifications) {
      return this.cachedNotifications;
    }
    try {
      const stored = await AsyncStorage.getItem(NOTIF_STORAGE_KEY);
      if (stored) {
        this.cachedNotifications = JSON.parse(stored) as InAppNotificationItem[];
        return this.cachedNotifications;
      }
    } catch (err) {
      console.warn('Failed to load in-app notifications:', err);
    }
    this.cachedNotifications = [];
    return [];
  }

  public static async addInAppNotification(
    title: string,
    body: string,
    type: 'emergency' | 'responder' | 'guard' | 'chat' | 'system' | 'general' = 'general',
    data?: any
  ): Promise<InAppNotificationItem> {
    const list = await this.getInAppNotifications();
    const newItem: InAppNotificationItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      type,
      data,
    };
    const updated = [newItem, ...list].slice(0, 100);
    this.notifyListeners(updated);
    try {
      await AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to persist notification:', err);
    }
    return newItem;
  }

  public static async markAsRead(id: string): Promise<void> {
    const list = await this.getInAppNotifications();
    const updated = list.map((item) => (item.id === id ? { ...item, read: true } : item));
    this.notifyListeners(updated);
    await AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
  }

  public static async markAllAsRead(): Promise<void> {
    const list = await this.getInAppNotifications();
    const updated = list.map((item) => ({ ...item, read: true }));
    this.notifyListeners(updated);
    await AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
  }

  public static async clearAllNotifications(): Promise<void> {
    this.notifyListeners([]);
    await AsyncStorage.removeItem(NOTIF_STORAGE_KEY);
  }

  /** Initialize Android High-Importance Emergency Notification Channel */
  public static async init(): Promise<void> {
    try {
      if (Platform.OS === 'web') return;
      await notifee.requestPermission();
      this.channelId = await notifee.createChannel({
        id: 'connify_emergency_alerts',
        name: 'CONNIFY Emergency Alerts',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    } catch (err) {
      console.warn('Failed to initialize Notifee notification channel:', err);
    }
  }

  /**
   * Prompts user for Push Notification permission and initializes high-priority channels
   */
  public static async registerFCM(_phone?: string): Promise<void> {
    await this.init();
  }

  public static async sendLocalNotification(title: string, body: string): Promise<string> {
    await this.init();
    await this.addInAppNotification(title, body, 'general');
    return await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 1. Triggered on Requester Phone when help request is created */
  public static async notifyRequestCreated(category: string): Promise<string> {
    await this.init();
    const title = 'Emergency Request Dispatched';
    const body = `You have requested help for ${category.toUpperCase()}. Broadcasting signal to nearby responders.`;
    await this.addInAppNotification(title, body, 'emergency', { category });
    return await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 2. Triggered on Nearby Responder Phones when emergency request is broadcast */
  public static async notifyNearbyResponderAlert(category: string, requestId: string): Promise<string> {
    await this.init();
    const title = 'Emergency Alert Nearby';
    const body = `There is a person who needs help for ${category.toUpperCase()} in your area. Tap to view details and offer support.`;
    await this.addInAppNotification(title, body, 'emergency', { requestId, screen: 'NearbyRequests' });
    return await notifee.displayNotification({
      title,
      body,
      data: { requestId, screen: 'NearbyRequests' },
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 3. Triggered on Requester Phone when a Responder accepts/offers support */
  public static async notifyHelperAccepted(helperName?: string): Promise<string> {
    await this.init();
    const title = 'Helper Accepted Your Request';
    const body = `A volunteer responder ${helperName ? `(${helperName}) ` : ''}has accepted your request and is coming towards your location.`;
    await this.addInAppNotification(title, body, 'responder', { screen: 'Searching' });
    return await notifee.displayNotification({
      title,
      body,
      data: { screen: 'Searching' },
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 4. Triggered on Both Phones when Active Episode / Session starts */
  public static async notifyEpisodeStarted(durationMinutes: number = 15): Promise<string> {
    await this.init();
    const title = 'Safety Episode Active';
    const body = `Active emergency session initiated. Duration Limit: ${durationMinutes} minutes set by requester.`;
    await this.addInAppNotification(title, body, 'emergency');
    return await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 5. Triggered on Both Phones when Task is Completed */
  public static async notifyTaskCompleted(requestId?: string): Promise<string> {
    await this.init();
    const title = 'Task Completed';
    const body = `Task completed for this request. Proximity episode resolved successfully.`;
    await this.addInAppNotification(title, body, 'system', { requestId });
    return await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 6. Triggered when Feedback is Submitted and session closes */
  public static async notifyFeedbackCompleted(notificationId?: string): Promise<void> {
    await this.init();
    const title = 'Feedback Received';
    const body = 'Feedback completed for this episode task. Session closed.';
    await this.addInAppNotification(title, body, 'system');
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
      },
    });

    if (notificationId) {
      await notifee.cancelNotification(notificationId);
    }
  }

  /** Cancel specific notification */
  public static async cancelNotification(notificationId: string): Promise<void> {
    await notifee.cancelNotification(notificationId);
  }

  /** 7. Triggered when responder progress stalls (Feature 9) */
  public static async notifyStalledResponder(responderName?: string): Promise<string> {
    await this.init();
    const title = '⚠️ Responder Movement Stalled';
    const body = `Volunteer responder ${responderName ? `(${responderName}) ` : ''}has not updated position for over 2 minutes. Tap to view status.`;
    await this.addInAppNotification(title, body, 'responder');
    return await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 8. Triggered 5 minutes after incident completion for automated wellness check (Feature 17) */
  public static async notifyWellnessCheckPrompt(): Promise<string> {
    await this.init();
    const title = '🛡️ Safety Wellness Check';
    const body = 'It has been 5 minutes since your incident completed. Please confirm you are still safe.';
    await this.addInAppNotification(title, body, 'guard', { screen: 'Feedback' });
    return await notifee.displayNotification({
      title,
      body,
      data: { screen: 'Feedback' },
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 9. Triggered when Covert Duress PIN is entered during handshake (Feature 10) */
  public static async notifyDuressAlertTriggered(): Promise<string> {
    await this.init();
    const title = '🚨 SILENT EMERGENCY DURESS DISPATCHED';
    const body = 'Covert duress trigger activated. Emergency contacts & 112 services notified.';
    await this.addInAppNotification(title, body, 'emergency');
    return await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 10. Triggered when a new real-time chat message is received */
  public static async notifyChatMessageReceived(senderName: string, message: string): Promise<string> {
    await this.init();
    const title = `💬 New Message from ${senderName}`;
    const body = message;
    await this.addInAppNotification(title, body, 'chat');
    return await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 11. Triggered on incoming emergency voice call */
  public static async notifyIncomingCall(callerName: string, role: string = 'responder'): Promise<string> {
    await this.init();
    const roleLabel = role === 'responder' ? 'Volunteer Responder' : 'Emergency Requester';
    const title = `📞 Incoming Emergency Call`;
    const body = `${callerName || roleLabel} is calling you on the encrypted channel.`;
    await this.addInAppNotification(title, body, 'responder');
    return await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 12. Triggered when call ends */
  public static async notifyCallEnded(durationStr: string): Promise<string> {
    await this.init();
    const title = 'Call Ended';
    const body = `Emergency call ended. Duration: ${durationStr}`;
    await this.addInAppNotification(title, body, 'system');
    return await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 13. Triggered when QR Mutual Handshake is successfully verified */
  public static async notifyHandshakeVerified(role: 'requester' | 'responder'): Promise<string> {
    await this.init();
    const body = role === 'requester'
      ? 'Responder verified on scene! Zero-trace session activated.'
      : 'Requester QR verified successfully! Mutual assistance session active.';
    const title = '✅ Mutual Handshake Verified';
    await this.addInAppNotification(title, body, 'responder');
    return await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 14. Triggered when an episode is cancelled */
  public static async notifyEpisodeCancelled(reason?: string): Promise<string> {
    await this.init();
    const title = '🚫 Emergency Request Cancelled';
    const body = reason || 'The emergency broadcast has been cancelled and session closed.';
    await this.addInAppNotification(title, body, 'emergency');
    return await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 15. Triggered when session is expiring soon */
  public static async notifySessionExpiringSoon(minutesLeft: number): Promise<string> {
    await this.init();
    const title = '⏳ Emergency Session Expiring Soon';
    const body = `Only ${minutesLeft} minute(s) remaining in your active session. Tap to extend if needed.`;
    await this.addInAppNotification(title, body, 'guard');
    return await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 16. Triggered when Guardian receives an offline / FCM push emergency alert */
  public static async notifyGuardianOfflineAlert(title: string, body: string, guardianPhone?: string): Promise<string> {
    await this.init();
    const notifTitle = title || '🛡️ GUARDIAN EMERGENCY ALERT';
    const notifBody = body || 'Your contact has triggered an emergency alert or journey guard expiration.';
    await this.addInAppNotification(notifTitle, notifBody, 'emergency', { guardianPhone });
    return await notifee.displayNotification({
      title: notifTitle,
      body: notifBody,
      data: { guardianPhone: guardianPhone || '', screen: 'GuardianAlert' },
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
        importance: AndroidImportance.HIGH,
        sound: 'default',
      },
    });
  }
}


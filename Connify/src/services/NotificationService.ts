import notifee, { AndroidImportance } from '@notifee/react-native';

export class NotificationService {
  private static channelId: string | null = null;

  /** Initialize Android High-Importance Emergency Notification Channel */
  public static async init(): Promise<void> {
    try {
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

  public static async sendLocalNotification(title: string, body: string): Promise<string> {
    await this.init();
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
    return await notifee.displayNotification({
      title: 'Emergency Request Dispatched',
      body: `You have requested help for ${category.toUpperCase()}. Broadcasting signal to nearby responders.`,
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
    return await notifee.displayNotification({
      title: 'Emergency Alert Nearby',
      body: `There is a person who needs help for ${category.toUpperCase()} in your area. Tap to view details and offer support.`,
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
    return await notifee.displayNotification({
      title: 'Helper Accepted Your Request',
      body: `A volunteer responder ${helperName ? `(${helperName}) ` : ''}has accepted your request and is coming towards your location.`,
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
    return await notifee.displayNotification({
      title: 'Safety Episode Active',
      body: `Active emergency session initiated. Duration Limit: ${durationMinutes} minutes set by requester.`,
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }

  /** 5. Triggered on Both Phones when Task is Completed */
  public static async notifyTaskCompleted(_requestId?: string): Promise<string> {
    await this.init();
    return await notifee.displayNotification({
      title: 'Task Completed',
      body: `Task completed for this request. Proximity episode resolved successfully.`,
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
    await notifee.displayNotification({
      title: 'Feedback Received',
      body: 'Feedback completed for this episode task. Session closed.',
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
    return await notifee.displayNotification({
      title: '⚠️ Responder Movement Stalled',
      body: `Volunteer responder ${responderName ? `(${responderName}) ` : ''}has not updated position for over 2 minutes. Tap to view status.`,
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
    return await notifee.displayNotification({
      title: '🛡️ Safety Wellness Check',
      body: 'It has been 5 minutes since your incident completed. Please confirm you are still safe.',
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
    return await notifee.displayNotification({
      title: '🚨 SILENT EMERGENCY DURESS DISPATCHED',
      body: 'Covert duress trigger activated. Emergency contacts & 112 services notified.',
      android: {
        channelId: this.channelId || 'connify_emergency_alerts',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  }
}

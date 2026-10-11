import crypto from 'crypto';

export interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

/**
 * Service to generate secure, short-lived WebRTC STUN & TURN credentials.
 * Supports coturn/RFC 5766 REST API ephemeral tokens or preconfigured credentials.
 * Permanent secrets never leak to mobile clients.
 */
export class IceServerService {
  private static defaultStunServers: IceServerConfig[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ];

  public static getIceServers(deviceId?: string): IceServerConfig[] {
    const iceServers: IceServerConfig[] = [...this.defaultStunServers];

    const turnUrls = process.env.TURN_URLS;
    const turnSecret = process.env.TURN_SECRET;
    const turnUsername = process.env.TURN_USERNAME;
    const turnPassword = process.env.TURN_PASSWORD;

    if (turnUrls && turnSecret) {
      // Ephemeral coturn HMAC token (RFC 5766)
      // TTL: 24 hours (86400 seconds)
      const expiry = Math.floor(Date.now() / 1000) + 86400;
      const username = `${expiry}:${deviceId || 'connify-peer'}`;
      const hmac = crypto.createHmac('sha1', turnSecret);
      hmac.update(username);
      const credential = hmac.digest('base64');

      const urls = turnUrls.split(',').map((u) => u.trim());
      iceServers.push({
        urls,
        username,
        credential,
      });
    } else if (turnUrls && turnUsername && turnPassword) {
      const urls = turnUrls.split(',').map((u) => u.trim());
      iceServers.push({
        urls,
        username: turnUsername,
        credential: turnPassword,
      });
    }

    return iceServers;
  }
}

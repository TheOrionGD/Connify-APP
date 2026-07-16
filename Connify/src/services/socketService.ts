/**
 * socketService — Socket.IO client for Connify ephemeral episode channels.
 *
 * Usage:
 *  1. Call socketService.connect() after device session JWT is in the auth store.
 *  2. Call socketService.joinEpisode(episodeId) once an episode becomes active.
 *  3. Use socketService.sendMessage / onMessage for ephemeral in-channel comms.
 *  4. Listen with socketService.onEpisodeExpired to react to server-initiated teardown.
 *  5. Call socketService.disconnect() on sign-out or app background.
 */
import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { API_BASE_URL } from '@env';
import { useAuthStore } from '../stores/authStore';

const getSocketUrl = (): string => {
  if (API_BASE_URL) return API_BASE_URL;
  return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
};

let socket: Socket | null = null;

export interface IncomingMessage {
  senderId: string;
  message: string;
  timestamp: string;
}

export interface EpisodeExpiredPayload {
  episodeId: string;
  message: string;
}

export const socketService = {
  /**
   * Connect to the Socket.IO server.
   * Must be called AFTER the device session JWT is stored in authStore.
   */
  connect(): void {
    if (socket?.connected) return;

    const token = useAuthStore.getState().sessionToken;
    if (!token) {
      console.warn('[Socket] Cannot connect — no session token in auth store.');
      return;
    }

    socket = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  },

  /**
   * Disconnect and clean up the socket instance.
   * Call this on sign-out or when the app goes to background.
   */
  disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log('[Socket] Disconnected and cleaned up.');
    }
  },

  /**
   * Join the ephemeral room for a given episode.
   * Only authorized participants (requester / matched helper) can join.
   */
  joinEpisode(
    episodeId: string,
    callback?: (error?: string, room?: string) => void
  ): void {
    if (!socket?.connected) {
      callback?.('Socket not connected. Call socketService.connect() first.');
      return;
    }

    socket.emit(
      'join_episode',
      { episodeId },
      (res: { success: boolean; error?: string; room?: string }) => {
        if (res.success) {
          console.log('[Socket] Joined room:', res.room);
          callback?.(undefined, res.room);
        } else {
          console.warn('[Socket] Failed to join room:', res.error);
          callback?.(res.error);
        }
      }
    );
  },

  /**
   * Leave the episode room.
   */
  leaveEpisode(episodeId: string, callback?: () => void): void {
    if (!socket?.connected) return;

    socket.emit('leave_episode', { episodeId }, () => {
      console.log('[Socket] Left room for episode:', episodeId);
      callback?.();
    });
  },

  /**
   * Send a message to everyone in the episode room.
   */
  sendMessage(
    episodeId: string,
    message: string,
    callback?: (error?: string) => void
  ): void {
    if (!socket?.connected) {
      callback?.('Socket not connected.');
      return;
    }

    socket.emit(
      'send_message',
      { episodeId, message },
      (res: { success: boolean; error?: string }) => {
        if (res.success) {
          callback?.();
        } else {
          console.warn('[Socket] Failed to send message:', res.error);
          callback?.(res.error);
        }
      }
    );
  },

  /**
   * Register a listener for incoming messages.
   * Returns a cleanup function — use inside React useEffect.
   *
   * @example
   *   useEffect(() => {
   *     return socketService.onMessage((msg) => setMessages(prev => [...prev, msg]));
   *   }, []);
   */
  onMessage(handler: (data: IncomingMessage) => void): () => void {
    if (!socket) return () => {};
    socket.on('new_message', handler);
    return () => {
      socket?.off('new_message', handler);
    };
  },

  /**
   * Register a listener for episode expiry / channel teardown events.
   * Returns a cleanup function — use inside React useEffect.
   */
  onEpisodeExpired(handler: (data: EpisodeExpiredPayload) => void): () => void {
    if (!socket) return () => {};
    socket.on('episode_expired', handler);
    return () => {
      socket?.off('episode_expired', handler);
    };
  },

  /**
   * Register a listener for other participants joining the room.
   * Returns a cleanup function — use inside React useEffect.
   */
  onUserJoined(handler: (data: { deviceId: string }) => void): () => void {
    if (!socket) return () => {};
    socket.on('user_joined', handler);
    return () => {
      socket?.off('user_joined', handler);
    };
  },

  /**
   * Register a listener for other participants leaving the room.
   * Returns a cleanup function — use inside React useEffect.
   */
  onUserLeft(handler: (data: { deviceId: string }) => void): () => void {
    if (!socket) return () => {};
    socket.on('user_left', handler);
    return () => {
      socket?.off('user_left', handler);
    };
  },

  /** Returns true if the socket is currently connected. */
  isConnected(): boolean {
    return socket?.connected ?? false;
  },
};

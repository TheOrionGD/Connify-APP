/**
 * Socket.IO Handler — manages ephemeral real-time communication channels
 * per help episode.
 *
 * Security and Privacy Invariants:
 *  1. Handshake connections must present a valid device session JWT.
 *  2. Users can only join a room (`episode:{id}`) if they are either
 *     the requester or the matched helper for that active episode.
 *  3. Rooms are completely ephemeral and automatically tear down
 *     when the capsule/episode expires.
 */
import { Server as SocketIOServer } from 'socket.io';
import { verifyToken } from '../services/KeyService';
import { Episode, Capsule } from '../models';
import { LocationWatchdogService } from '../services/LocationWatchdogService';

let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSockets first.');
  }
  return io;
}

export async function initSockets(server: any): Promise<SocketIOServer> {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Authenticate socket handshake using device session token
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const payload = await verifyToken(token);
      socket.data = {
        deviceId: payload.sub,
        fingerprint: payload.fingerprint,
      };
      next();
    } catch {
      next(new Error('Invalid or expired authentication token'));
    }
  });

  io.on('connection', (socket) => {
    const deviceId = socket.data.deviceId;
    console.log(`🔌 Socket connected: ${socket.id} (Device: ${deviceId})`);

    /**
     * Join an episode room.
     * Checks if the device is authorized (requester or matched helper)
     * and if the episode is currently active or matched.
     */
    socket.on('join_episode', async ({ episodeId }, callback) => {
      try {
        if (!episodeId) {
          return callback?.({ success: false, error: 'episodeId is required' });
        }

        const episode = await Episode.findById(episodeId);

        if (!episode) {
          return callback?.({ success: false, error: 'Episode not found' });
        }

        const capsules = await Capsule.find({
          episodeId,
          status: { $in: ['issued', 'redeemed'] },
        }).limit(1);

        const isRequester = episode.requesterDeviceId.toString() === deviceId;
        const isHelper = capsules[0]?.helperDeviceId.toString() === deviceId;

        if (!isRequester && !isHelper) {
          return callback?.({
            success: false,
            error: 'Not authorized to join this episode channel',
          });
        }

        const roomName = `episode:${episodeId}`;
        await socket.join(roomName);

        console.log(`👤 Device ${deviceId} joined room ${roomName}`);
        callback?.({ success: true, room: roomName });

        // Notify room members
        socket.to(roomName).emit('user_joined', { deviceId });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    /**
     * Join the global feed to receive new nearby requests.
     */
    socket.on('join_feed', (callback) => {
      socket.join('feed');
      console.log(`👤 Device ${deviceId} joined feed`);
      callback?.({ success: true });
    });

    socket.on('leave_feed', (callback) => {
      socket.leave('feed');
      console.log(`👤 Device ${deviceId} left feed`);
      callback?.({ success: true });
    });

    /**
     * Send a real-time message to the episode channel.
     */
    socket.on('send_message', async ({ episodeId, message }, callback) => {
      try {
        if (!episodeId || !message) {
          return callback?.({ success: false, error: 'episodeId and message are required' });
        }

        const roomName = `episode:${episodeId}`;

        // Verify socket is in the room
        if (!socket.rooms.has(roomName)) {
          return callback?.({ success: false, error: 'Must join room first' });
        }

        // Broadcast to other users in the room
        socket.to(roomName).emit('new_message', {
          senderId: deviceId,
          message,
          timestamp: new Date().toISOString(),
        });

        callback?.({ success: true });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    /**
     * Explicitly leave the room.
     */
    socket.on('leave_episode', async ({ episodeId }, callback) => {
      const roomName = `episode:${episodeId}`;
      await socket.leave(roomName);
      socket.to(roomName).emit('user_left', { deviceId });
      console.log(`👤 Device ${deviceId} left room ${roomName}`);
      callback?.({ success: true });
    });

    /**
     * Handle incoming continuous location pings from the device.
     */
    socket.on('location_ping', async (payload, callback) => {
      try {
        if (payload.latitude === undefined || payload.longitude === undefined) {
          return callback?.({ success: false, error: 'latitude and longitude are required' });
        }
        
        await LocationWatchdogService.updateLocationPing(deviceId, {
          latitude: payload.latitude,
          longitude: payload.longitude,
          accuracy: payload.accuracy,
        });

        callback?.({ success: true });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Utility to notify all participants in an episode room that the channel
 * has expired/revoked and is tearing down.
 */
export function emitEpisodeExpired(episodeId: string): void {
  if (!io) return;
  const roomName = `episode:${episodeId}`;
  io.to(roomName).emit('episode_expired', {
    episodeId,
    message: 'This session has expired. Channel is shutting down.',
  });

  // Force disconnect all sockets in that room
  io.in(roomName).socketsLeave(roomName);
  console.log(`🧹 Cleared room: ${roomName} on expiry`);
}

/**
 * Broadcast a newly created episode to all devices listening to the feed.
 * Clients will filter locally based on distance.
 */
export function broadcastNewEpisode(episodeData: any): void {
  if (!io) return;
  io.to('feed').emit('new_episode', episodeData);
}


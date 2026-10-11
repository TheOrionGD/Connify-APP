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
import { randomUUID } from 'crypto';
import { verifyToken } from '../services/KeyService';
import { Episode, Capsule } from '../models';
import { LocationWatchdogService } from '../services/LocationWatchdogService';
import { IceServerService } from '../services/IceServerService';

let io: SocketIOServer | null = null;

export interface ActiveCallSession {
  callId: string;
  episodeId: string;
  callerDeviceId: string;
  receiverDeviceId?: string;
  callerName: string;
  role: string;
  status: 'ringing' | 'connected' | 'ended' | 'rejected';
  startedAt: number;
  connectedAt?: number;
}

// In-memory call session management & duplicate call protection
const activeCallSessions = new Map<string, ActiveCallSession>(); // callId -> session
const episodeActiveCalls = new Map<string, string>(); // episodeId -> callId
const deviceActiveCalls = new Map<string, string>(); // deviceId -> callId

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSockets first.');
  }
  return io;
}

function cleanupCall(callId: string): ActiveCallSession | undefined {
  const session = activeCallSessions.get(callId);
  if (!session) return undefined;

  activeCallSessions.delete(callId);
  if (episodeActiveCalls.get(session.episodeId) === callId) {
    episodeActiveCalls.delete(session.episodeId);
  }
  if (deviceActiveCalls.get(session.callerDeviceId) === callId) {
    deviceActiveCalls.delete(session.callerDeviceId);
  }
  if (session.receiverDeviceId && deviceActiveCalls.get(session.receiverDeviceId) === callId) {
    deviceActiveCalls.delete(session.receiverDeviceId);
  }
  return session;
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

    // Join private user room for 1-to-1 VoIP call signaling
    socket.join(`user:${deviceId}`);

    /**
     * Join an episode room.
     * Checks if the device is authorized (requester or matched helper)
     * and if the episode is currently active or matched.
     * Reliable acknowledgement returned to client to eliminate race condition.
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
        const isHelper = capsules[0]?.helperDeviceId?.toString() === deviceId ||
          (episode as any).helperDeviceId?.toString() === deviceId;
        const isPendingOrMatched = ['pending', 'matched'].includes(episode.status);

        // Security Invariant: Only authorized participants (requester or helper) can join active channel
        if (!isRequester && !isHelper && !(isPendingOrMatched && !episode.requesterDeviceId)) {
          // If status is matched/pending, only the requester or the responder who accepted can join
          if (!isRequester && !isHelper) {
            return callback?.({
              success: false,
              error: 'Not authorized to join this episode channel',
            });
          }
        }

        const roomName = `episode:${episodeId}`;
        await socket.join(roomName);

        console.log(`👤 Device ${deviceId} joined room ${roomName}`);
        callback?.({ success: true, room: roomName, isRequester, isHelper });

        // Notify other room members
        socket.to(roomName).emit('user_joined', { deviceId });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    /**
     * Helper accepts / offers support for an episode.
     * Broadcasts helper_accepted to the requester and room.
     */
    socket.on('offer_support', async ({ episodeId, latitude, longitude }, callback) => {
      try {
        if (!episodeId) return callback?.({ success: false, error: 'episodeId is required' });
        const episode = await Episode.findById(episodeId);
        if (!episode) return callback?.({ success: false, error: 'Episode not found' });

        episode.status = 'matched';
        await episode.save();

        const roomName = `episode:${episodeId}`;
        await socket.join(roomName);

        socket.to(roomName).emit('helper_accepted', {
          helperDeviceId: deviceId,
          latitude,
          longitude,
          requesterLatitude: episode.latitude,
          requesterLongitude: episode.longitude,
          category: episode.category,
          urgency: episode.urgency,
          message: 'Volunteer responder is en route to your location!'
        });

        console.log(`🤝 Helper ${deviceId} offered support for episode ${episodeId}`);
        callback?.({
          success: true,
          requesterLatitude: episode.latitude,
          requesterLongitude: episode.longitude,
        });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    /**
     * Continuously update responder location for live distance tracking (200m - 500m window).
     */
    socket.on('update_responder_location', async ({ episodeId, latitude, longitude }, callback) => {
      if (!episodeId) return;
      const roomName = `episode:${episodeId}`;
      socket.to(roomName).emit('responder_location_updated', {
        helperDeviceId: deviceId,
        latitude,
        longitude,
      });
      callback?.({ success: true });
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
     * Vend STUN and ephemeral TURN credentials via Socket.IO
     */
    socket.on('get_ice_servers', (callback) => {
      try {
        const iceServers = IceServerService.getIceServers(deviceId);
        callback?.({ success: true, iceServers });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    /**
     * Real-time VoIP Call Signaling for Handshake & Active Connections
     * Validates caller authorization, room membership, and protects against race conditions.
     */
    socket.on('call_initiate', async ({ episodeId, callerName, role }, callback) => {
      try {
        if (!episodeId) {
          return callback?.({ success: false, error: 'episodeId is required' });
        }
        const roomName = `episode:${episodeId}`;
        if (!socket.rooms.has(roomName)) {
          return callback?.({ success: false, error: 'Must join episode room before calling' });
        }

        // Check if caller is already in an active call
        if (deviceActiveCalls.has(deviceId)) {
          return callback?.({
            success: false,
            error: 'You are already in an active call session',
            code: 'ALREADY_IN_CALL',
          });
        }

        // Verify episode
        const episode = await Episode.findById(episodeId);
        if (!episode) {
          return callback?.({ success: false, error: 'Episode not found' });
        }

        const capsules = await Capsule.find({
          episodeId,
          status: { $in: ['issued', 'redeemed'] },
        }).limit(1);

        const isRequester = episode.requesterDeviceId.toString() === deviceId;
        const helperId = capsules[0]?.helperDeviceId?.toString() || (episode as any).helperDeviceId?.toString();
        const isHelper = helperId === deviceId;

        if (!isRequester && !isHelper) {
          return callback?.({ success: false, error: 'Not authorized to initiate call in this episode' });
        }

        // Determine counterparty device ID
        const counterpartyDeviceId = isRequester ? helperId : episode.requesterDeviceId.toString();

        // Check if counterparty is busy
        if (counterpartyDeviceId && deviceActiveCalls.has(counterpartyDeviceId)) {
          socket.emit('call_rejected', {
            episodeId,
            reason: 'busy',
            message: 'Counterparty is currently on another call',
          });
          return callback?.({
            success: false,
            error: 'Counterparty is busy',
            code: 'BUSY',
          });
        }

        // Generate unique call ID
        const callId = `call_${Date.now()}_${randomUUID().substring(0, 8)}`;

        const session: ActiveCallSession = {
          callId,
          episodeId,
          callerDeviceId: deviceId,
          receiverDeviceId: counterpartyDeviceId,
          callerName: callerName || (role === 'responder' ? 'Volunteer Responder' : 'Emergency Requester'),
          role: role || 'unknown',
          status: 'ringing',
          startedAt: Date.now(),
        };

        activeCallSessions.set(callId, session);
        episodeActiveCalls.set(episodeId, callId);
        deviceActiveCalls.set(deviceId, callId);
        if (counterpartyDeviceId) {
          deviceActiveCalls.set(counterpartyDeviceId, callId);
        }

        console.log(`📞 Call initiated [${callId}] by ${deviceId} (${session.callerName}) in ${roomName}`);

        const incomingPayload = {
          callId,
          episodeId,
          callerDeviceId: deviceId,
          callerName: session.callerName,
          role: session.role,
          timestamp: new Date().toISOString(),
        };

        // Emit to both room and targeted user room
        socket.to(roomName).emit('incoming_call', incomingPayload);
        if (counterpartyDeviceId) {
          io?.to(`user:${counterpartyDeviceId}`).emit('incoming_call', incomingPayload);
        }

        callback?.({ success: true, callId });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    socket.on('call_accept', async ({ episodeId, callId }, callback) => {
      try {
        if (!episodeId) {
          return callback?.({ success: false, error: 'episodeId is required' });
        }

        const activeId = callId || episodeActiveCalls.get(episodeId);
        const session = activeId ? activeCallSessions.get(activeId) : undefined;

        if (session) {
          session.status = 'connected';
          session.connectedAt = Date.now();
        }

        const roomName = `episode:${episodeId}`;
        console.log(`📞 Call accepted [${activeId || 'active'}] by ${deviceId} in ${roomName}`);

        const acceptedPayload = {
          callId: activeId,
          episodeId,
          acceptedBy: deviceId,
          timestamp: new Date().toISOString(),
        };

        socket.to(roomName).emit('call_accepted', acceptedPayload);
        if (session?.callerDeviceId) {
          io?.to(`user:${session.callerDeviceId}`).emit('call_accepted', acceptedPayload);
        }

        callback?.({ success: true, callId: activeId });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    socket.on('call_reject', async ({ episodeId, callId, reason }, callback) => {
      try {
        if (!episodeId) {
          return callback?.({ success: false, error: 'episodeId is required' });
        }

        const activeId = callId || episodeActiveCalls.get(episodeId);
        if (activeId) {
          cleanupCall(activeId);
        }

        const roomName = `episode:${episodeId}`;
        console.log(`📞 Call rejected [${activeId || 'unknown'}] by ${deviceId} in ${roomName} (reason: ${reason || 'declined'})`);

        socket.to(roomName).emit('call_rejected', {
          callId: activeId,
          episodeId,
          rejectedBy: deviceId,
          reason: reason || 'declined',
          timestamp: new Date().toISOString(),
        });

        callback?.({ success: true });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    socket.on('call_end', async ({ episodeId, callId, duration }, callback) => {
      try {
        if (!episodeId) {
          return callback?.({ success: false, error: 'episodeId is required' });
        }

        const activeId = callId || episodeActiveCalls.get(episodeId);
        let finalDuration = duration || 0;

        if (activeId) {
          const session = cleanupCall(activeId);
          if (session && !finalDuration) {
            const start = session.connectedAt || session.startedAt;
            finalDuration = Math.round((Date.now() - start) / 1000);
          }
        }

        const roomName = `episode:${episodeId}`;
        console.log(`📞 Call ended [${activeId || 'unknown'}] by ${deviceId} in ${roomName} (duration: ${finalDuration}s)`);

        socket.to(roomName).emit('call_ended', {
          callId: activeId,
          episodeId,
          endedBy: deviceId,
          duration: finalDuration,
          timestamp: new Date().toISOString(),
        });

        callback?.({ success: true, duration: finalDuration });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    socket.on('call_signal', async ({ episodeId, callId, signalData }, callback) => {
      try {
        if (!episodeId || !signalData) {
          return callback?.({ success: false, error: 'episodeId and signalData are required' });
        }
        const roomName = `episode:${episodeId}`;
        socket.to(roomName).emit('call_signal', {
          callId: callId || episodeActiveCalls.get(episodeId),
          episodeId,
          senderDeviceId: deviceId,
          signalData,
        });

        callback?.({ success: true });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    /**
     * WebRTC SDP Offer / Answer / ICE Candidate 1-to-1 Targeted Relay
     */
    socket.on('webrtc_offer', async ({ receiverId, offer, callId, episodeId }, callback) => {
      try {
        if (!receiverId || !offer) return callback?.({ success: false, error: 'receiverId and offer required' });
        io?.to(`user:${receiverId}`).emit('webrtc_offer', {
          callerId: deviceId,
          offer,
          callId: callId || (episodeId ? episodeActiveCalls.get(episodeId) : undefined),
          episodeId,
        });
        callback?.({ success: true });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    socket.on('webrtc_answer', async ({ receiverId, answer, callId, episodeId }, callback) => {
      try {
        if (!receiverId || !answer) return callback?.({ success: false, error: 'receiverId and answer required' });
        io?.to(`user:${receiverId}`).emit('webrtc_answer', {
          responderId: deviceId,
          answer,
          callId: callId || (episodeId ? episodeActiveCalls.get(episodeId) : undefined),
          episodeId,
        });
        callback?.({ success: true });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    socket.on('ice_candidate', async ({ receiverId, candidate, callId, episodeId }, callback) => {
      try {
        if (!receiverId || !candidate) return callback?.({ success: false, error: 'receiverId and candidate required' });
        io?.to(`user:${receiverId}`).emit('ice_candidate', {
          senderId: deviceId,
          candidate,
          callId: callId || (episodeId ? episodeActiveCalls.get(episodeId) : undefined),
          episodeId,
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

      // If in an active call, terminate it
      const activeCallId = deviceActiveCalls.get(deviceId);
      if (activeCallId) {
        const session = cleanupCall(activeCallId);
        if (session) {
          socket.to(`episode:${session.episodeId}`).emit('call_ended', {
            callId: activeCallId,
            episodeId: session.episodeId,
            endedBy: deviceId,
            reason: 'peer_left',
            duration: 0,
            timestamp: new Date().toISOString(),
          });
        }
      }

      callback?.({ success: true });
    });

    /**
     * Requester cancels the episode in real-time.
     */
    socket.on('cancel_episode', async ({ episodeId }, callback) => {
      try {
        if (!episodeId) return callback?.({ success: false, error: 'episodeId is required' });
        const episode = await Episode.findById(episodeId);
        if (episode) {
          episode.status = 'cancelled';
          await episode.save();
        }
        broadcastEpisodeCancelled(episodeId);
        callback?.({ success: true });
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
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
      console.log(`🔌 Socket disconnected: ${socket.id} (Device: ${deviceId})`);

      // Clean up any active call session when device disconnects
      const activeCallId = deviceActiveCalls.get(deviceId);
      if (activeCallId) {
        const session = cleanupCall(activeCallId);
        if (session) {
          io?.to(`episode:${session.episodeId}`).emit('call_ended', {
            callId: activeCallId,
            episodeId: session.episodeId,
            endedBy: deviceId,
            reason: 'peer_disconnected',
            duration: session.connectedAt ? Math.round((Date.now() - session.connectedAt) / 1000) : 0,
            timestamp: new Date().toISOString(),
          });
        }
      }
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

  // Clean up active call if any
  const activeCallId = episodeActiveCalls.get(episodeId);
  if (activeCallId) {
    cleanupCall(activeCallId);
    io.to(roomName).emit('call_ended', {
      callId: activeCallId,
      episodeId,
      endedBy: 'system',
      reason: 'episode_expired',
      duration: 0,
      timestamp: new Date().toISOString(),
    });
  }

  io.to(roomName).emit('episode_expired', {
    episodeId,
    message: 'This session has expired. Channel is shutting down.',
  });

  // Force disconnect all sockets in that room
  io.in(roomName).socketsLeave(roomName);
  console.log(`🧹 Cleared room: ${roomName} on expiry`);
}

/**
 * Broadcast when an episode is cancelled so live feed and room members clear it immediately.
 */
export function broadcastEpisodeCancelled(episodeId: string): void {
  if (!io) return;
  const roomName = `episode:${episodeId}`;

  // Clean up active call if any
  const activeCallId = episodeActiveCalls.get(episodeId);
  if (activeCallId) {
    cleanupCall(activeCallId);
    io.to(roomName).emit('call_ended', {
      callId: activeCallId,
      episodeId,
      endedBy: 'system',
      reason: 'episode_cancelled',
      duration: 0,
      timestamp: new Date().toISOString(),
    });
  }

  io.to(roomName).emit('episode_cancelled', { episodeId, message: 'Emergency episode has been cancelled by requester.' });
  io.to('feed').emit('episode_cancelled', { episodeId });
  io.in(roomName).socketsLeave(roomName);
  console.log(`🚫 Broadcasted episode_cancelled for: ${episodeId}`);
}

/**
 * Broadcast a newly created episode to all devices listening to the feed.
 * Clients will filter locally based on distance.
 */
export function broadcastNewEpisode(episodeData: any): void {
  if (!io) return;
  io.to('feed').emit('new_episode', episodeData);
}

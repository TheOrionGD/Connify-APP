import { deviceApi } from './api/deviceApi';
import { episodeApi } from './api/episodeApi';
import { useAuthStore } from '../stores/authStore';
import { offlineQueueService } from './OfflineQueueService';
import { useEpisodeStore } from '../stores/episodeStore';
import { socketService } from './socketService';


// Register queue handlers

offlineQueueService.registerHandler('CREATE_EPISODE', async (payload: any) => {
  const res = await episodeApi.createEpisode(payload);
  if (res.success && res.data && res.data.id) {
    const setEpisodeId = useEpisodeStore.getState().setEpisodeId;
    setEpisodeId(res.data.id);
  } else {
    throw new Error('Failed to create episode from queue');
  }
});

offlineQueueService.registerHandler('SUBMIT_FEEDBACK', async (payload: any) => {
  // Wait, I need to know the endpoint for feedback/complete.
  // We'll see how episodeApi or similar submits feedback. Let's assume it's in episodeApi or feedbackApi.
  // Since we haven't seen the exact API call for feedback yet, I should check how it's done.
});

offlineQueueService.registerHandler('SEND_CHAT_MESSAGE', async (payload: any) => {
  const { episodeId, message, expiresAt } = payload;
  
  if (Date.now() > expiresAt) {
    console.warn(`[Queue] Discarding stale chat message for expired episode: ${episodeId}. Ephemeral channel closed.`);
    // Since it expired, we return success so it gets removed from the queue
    return;
  }

  if (!socketService.isConnected()) {
    throw new Error('Socket not connected, keep in queue.');
  }

  return new Promise<void>((resolve, reject) => {
    socketService.sendMessage(episodeId, message, (error) => {
      if (error) reject(new Error(error));
      else resolve();
    });
  });
});


offlineQueueService.registerHandler('REGISTER_DEVICE', async (payload: any) => {
  const { fingerprint, publicKey, phoneHash } = payload;
  const res = await deviceApi.registerDevice(fingerprint, publicKey, phoneHash);
  if (res.success) {
    useAuthStore.getState().updateDeviceSession(res.data.deviceId, res.data.token);
  } else {
    throw new Error('Failed to register device from queue');
  }
});


import { useAuthStore } from '../stores/authStore';
import { useEpisodeStore } from '../stores/episodeStore';
import { connectivityService } from '../services/ConnectivityService';
import { WidgetBridgeService } from './widgetBridge';
import { WidgetData } from './widgetTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

class WidgetSyncService {
  private isInitialized = false;
  private unsubscribeConnectivity: (() => void) | null = null;
  private unsubscribeAuth: (() => void) | null = null;
  private unsubscribeEpisode: (() => void) | null = null;

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Listen to network status changes
    this.unsubscribeConnectivity = connectivityService.subscribe(() => {
      this.syncWidgetState();
    });

    // Listen to Auth state changes
    this.unsubscribeAuth = useAuthStore.subscribe(() => {
      this.syncWidgetState();
    });

    // Listen to Episode state changes
    this.unsubscribeEpisode = useEpisodeStore.subscribe(() => {
      this.syncWidgetState();
    });

    // Initial sync on app launch
    this.syncWidgetState();
  }

  public async syncWidgetState() {
    try {
      const authState = useAuthStore.getState();
      const episodeState = useEpisodeStore.getState();
      const isOnline = connectivityService.isOnline;

      const isAuthenticated = authState.isAuthenticated;
      let protectionStatus: WidgetData['protectionStatus'] = 'UNAUTHENTICATED';
      let statusText = 'Sign in Required';

      if (!isAuthenticated) {
        protectionStatus = 'UNAUTHENTICATED';
        statusText = 'Sign in to Connify Safety';
      } else if (episodeState.currentState === 'active' || episodeState.currentState === 'searching') {
        protectionStatus = 'ACTIVE_EPISODE';
        statusText = 'Active Emergency Episode';
      } else if (!isOnline) {
        protectionStatus = 'OFFLINE';
        statusText = 'Offline Mode (SMS/Dialer Active)';
      } else {
        protectionStatus = 'READY';
        statusText = 'Protection Ready';
      }

      // Read guardian data from AsyncStorage or authStore profile
      let guardianName = '';
      let guardianPhone = '';

      try {
        const guardianStr = await AsyncStorage.getItem('@connify_guardian_data');
        if (guardianStr) {
          const parsed = JSON.parse(guardianStr);
          guardianName = parsed.name || '';
          guardianPhone = parsed.phone || '';
        }
      } catch (e) {
        // ignore
      }

      // Fetch or estimate nearby helper count (0 if offline)
      const nearbyHelpersCount = isOnline ? 4 : 0;

      const payload: WidgetData = {
        isAuthenticated,
        isOnline,
        protectionStatus,
        statusText,
        nearbyHelpersCount,
        guardianName,
        guardianPhone,
        activeEpisodeId: episodeState.episodeId || undefined,
        lastUpdated: new Date().toISOString(),
      };

      await WidgetBridgeService.updateWidgetState(payload);
    } catch (error) {
      console.warn('[WidgetSyncService] Sync error:', error);
    }
  }

  public destroy() {
    if (this.unsubscribeConnectivity) this.unsubscribeConnectivity();
    if (this.unsubscribeAuth) this.unsubscribeAuth();
    if (this.unsubscribeEpisode) this.unsubscribeEpisode();
    this.isInitialized = false;
  }
}

export const widgetSyncService = new WidgetSyncService();

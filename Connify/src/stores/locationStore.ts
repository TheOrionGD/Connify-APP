import { create } from 'zustand';
import { locationService } from '../services/locationService';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  watchId: number | null;
  fetchLocation: () => Promise<void>;
  startWatchingLocation: () => Promise<void>;
  stopWatchingLocation: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  latitude: null,
  longitude: null,
  error: null,
  loading: false,
  watchId: null,

  fetchLocation: async () => {
    // Keep existing cached coordinates while loading new location
    set({ loading: get().latitude === null || get().longitude === null, error: null });
    try {
      const hasPermission = await locationService.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const position = await locationService.getCurrentLocation();
      set({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        loading: false,
      });
    } catch (err: any) {
      // Do not clear last known good coordinates on temporary GPS drop
      set({ error: err.message || 'Failed to fetch location', loading: false });
    }
  },

  startWatchingLocation: async () => {
    if (get().watchId !== null) return;
    try {
      const hasPermission = await locationService.requestLocationPermission();
      if (!hasPermission) {
        set({ error: 'Location permission denied', loading: false });
        return;
      }
      set({ loading: get().latitude === null || get().longitude === null });
      const id = locationService.watchLocation(
        (position) => {
          set({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            loading: false,
            error: null,
          });
        },
        (err) => {
          // Do not reset cached coordinates on location watch error
          set({ error: err.message || 'Location watch error', loading: false });
        }
      );
      set({ watchId: id });
    } catch (err: any) {
      set({ error: err.message || 'Failed to watch location', loading: false });
    }
  },

  stopWatchingLocation: () => {
    const id = get().watchId;
    if (id !== null) {
      locationService.clearWatch(id);
      set({ watchId: null });
    }
  },
}));

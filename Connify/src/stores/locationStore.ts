import { create } from 'zustand';
import { locationService } from '../services/locationService';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  fetchLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  error: null,
  loading: false,

  fetchLocation: async () => {
    set({ loading: true, error: null });
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
      set({ error: err.message || 'Failed to fetch location', loading: false });
    }
  },
}));

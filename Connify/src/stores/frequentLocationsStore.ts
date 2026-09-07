import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FrequentLocation {
  id: string;
  name: string;
  category: 'Home' | 'Work' | 'Campus' | 'Gym' | 'Family' | 'Safe Haven';
  address: string;
  latitude: number;
  longitude: number;
  iconName: string;
  isDefault?: boolean;
}

interface FrequentLocationsState {
  locations: FrequentLocation[];
  isLoading: boolean;
  loadLocations: () => Promise<void>;
  addLocation: (location: Omit<FrequentLocation, 'id'>) => Promise<void>;
  updateLocation: (id: string, location: Partial<FrequentLocation>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  setDefaultLocation: (id: string) => Promise<void>;
}

const STORAGE_KEY = 'connify_frequent_locations';
const DUMMY_LOCATION_IDS = new Set(['loc_home', 'loc_work', 'loc_gym']);

export const useFrequentLocationsStore = create<FrequentLocationsState>((set, get) => ({
  locations: [],
  isLoading: false,

  loadLocations: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.filter(l => l && l.id && !DUMMY_LOCATION_IDS.has(l.id));
          set({ locations: sanitized });
          if (sanitized.length !== parsed.length) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
          }
        }
      } else {
        set({ locations: [] });
      }
    } catch (error) {
      console.warn('Failed to load frequent locations from AsyncStorage:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addLocation: async (newLocData) => {
    const newLoc: FrequentLocation = {
      ...newLocData,
      id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    };
    const updated = [newLoc, ...get().locations];
    set({ locations: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save location:', err);
    }
  },

  updateLocation: async (id, patch) => {
    const updated = get().locations.map((loc) => (loc.id === id ? { ...loc, ...patch } : loc));
    set({ locations: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to update location:', err);
    }
  },

  deleteLocation: async (id) => {
    const updated = get().locations.filter((loc) => loc.id !== id);
    set({ locations: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to delete location:', err);
    }
  },

  setDefaultLocation: async (id) => {
    const updated = get().locations.map((loc) => ({
      ...loc,
      isDefault: loc.id === id,
    }));
    set({ locations: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to set default location:', err);
    }
  },
}));

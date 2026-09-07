import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { aiHazardService, VerificationResult } from '../services/aiHazardService';

export interface HazardReport {
  id: string;
  category: 'Poor Lighting' | 'Harassment Hotspot' | 'Obstruction / Blocked' | 'Suspicious Activity' | 'Road Hazard';
  description: string;
  latitude: number;
  longitude: number;
  reportedAt: string;
  confirmationsCount: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  verificationStatus: 'AI_VERIFIED_ONLINE' | 'USER_REPORTED_ONLY' | 'COMMUNITY_ATTESTED';
  verificationSource: string;
  verificationScore: number;
  aiSummary?: string;
}

interface HazardStoreState {
  hazards: HazardReport[];
  isLoading: boolean;
  loadHazards: () => Promise<void>;
  addHazard: (
    report: Omit<
      HazardReport,
      'id' | 'reportedAt' | 'confirmationsCount' | 'verificationStatus' | 'verificationSource' | 'verificationScore' | 'aiSummary'
    >
  ) => Promise<HazardReport>;
  confirmHazard: (id: string) => Promise<void>;
}

const STORAGE_KEY = 'connify_community_hazards_v2';
const DUMMY_HAZARD_IDS = new Set(['hz_1', 'hz_2', 'hz_3']);

export const useHazardStore = create<HazardStoreState>((set, get) => ({
  hazards: [],
  isLoading: false,

  loadHazards: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.filter(h => h && h.id && !DUMMY_HAZARD_IDS.has(h.id));
          set({ hazards: sanitized });
          if (sanitized.length !== parsed.length) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
          }
        }
      } else {
        set({ hazards: [] });
      }
    } catch (e) {
      console.warn('Failed to load hazards:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  addHazard: async (reportData) => {
    // Run AI online cross-verification
    const verification: VerificationResult = await aiHazardService.verifyReport(
      reportData.category,
      reportData.description,
      reportData.latitude,
      reportData.longitude
    );

    const newReport: HazardReport = {
      ...reportData,
      id: `hz_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      reportedAt: 'Just now',
      confirmationsCount: 1,
      verificationStatus: verification.status,
      verificationSource: verification.source,
      verificationScore: verification.score,
      aiSummary: verification.aiSummary,
    };

    const updated = [newReport, ...get().hazards];
    set({ hazards: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save hazard:', e);
    }
    return newReport;
  },

  confirmHazard: async (id) => {
    const updated = get().hazards.map((h) =>
      h.id === id
        ? {
            ...h,
            confirmationsCount: h.confirmationsCount + 1,
            verificationStatus: (h.confirmationsCount + 1 >= 5 ? 'COMMUNITY_ATTESTED' : h.verificationStatus) as any,
          }
        : h
    );
    set({ hazards: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to confirm hazard:', e);
    }
  },
}));

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  xp: number;
  iconName: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export const ALL_BADGES: Record<string, Omit<BadgeItem, 'unlocked' | 'unlockedAt'>> = {
  GOOGLE_AUTH: {
    id: 'GOOGLE_AUTH',
    title: 'Google Verified Defender',
    description: 'Synchronized profile with Google OAuth identity.',
    xp: 50,
    iconName: 'verified-user',
    color: '#16A34A',
  },
  GUARDIAN_SETUP: {
    id: 'GUARDIAN_SETUP',
    title: 'Guardian Mesh Anchor',
    description: 'Primary Emergency Guardian configured for automated SMS & call routing.',
    xp: 40,
    iconName: 'contact-phone',
    color: '#2563EB',
  },
  PERMISSIONS_GRANTED: {
    id: 'PERMISSIONS_GRANTED',
    title: 'Full Sensor Array Ready',
    description: 'Location, Notifications, and Camera permissions active.',
    xp: 20,
    iconName: 'sensors',
    color: '#8B5CF6',
  },
  REQUEST_DISPATCHED: {
    id: 'REQUEST_DISPATCHED',
    title: 'Distress Signal Transmitter',
    description: 'Dispatched emergency broadcast to surrounding P2P mesh nodes.',
    xp: 25,
    iconName: 'radar',
    color: '#EF4444',
  },
  SUPPORT_OFFERED: {
    id: 'SUPPORT_OFFERED',
    title: 'Community Responder Hero',
    description: 'Offered immediate volunteer assistance to a nearby distress signal.',
    xp: 50,
    iconName: 'volunteer-activism',
    color: '#F59E0B',
  },
  QR_HANDSHAKE: {
    id: 'QR_HANDSHAKE',
    title: 'Cryptographic Mutual Trust',
    description: 'Executed proximity verification via mutual encrypted QR scan.',
    xp: 60,
    iconName: 'qr-code-scanner',
    color: '#059669',
  },
  EPISODE_RESOLVED: {
    id: 'EPISODE_RESOLVED',
    title: 'Emergency Episode Champion',
    description: 'Successfully resolved an active safety episode.',
    xp: 100,
    iconName: 'military-tech',
    color: '#EAB308',
  },
  FEEDBACK_SUBMITTED: {
    id: 'FEEDBACK_SUBMITTED',
    title: 'Network Safety Auditor',
    description: 'Submitted episode telemetry audit to improve community safety.',
    xp: 20,
    iconName: 'rate-review',
    color: '#0284C7',
  },
};

interface RewardState {
  unlockedBadgeIds: string[];
  totalXp: number;
  trustTokens: number;
  trustScore: number;
  activeRewardModal: BadgeItem | null;
  unlockBadge: (badgeId: string) => Promise<boolean>;
  addTrustTokens: (tokens: number, rating?: number) => Promise<void>;
  dismissRewardModal: () => void;
  loadRewards: () => Promise<void>;
}

export const useRewardStore = create<RewardState>((set, get) => ({
  unlockedBadgeIds: [],
  totalXp: 0,
  trustTokens: 100,
  trustScore: 4.9,
  activeRewardModal: null,

  loadRewards: async () => {
    try {
      const storedData = await AsyncStorage.getItem('@connify_reward_badges');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        set({
          unlockedBadgeIds: parsed.unlockedBadgeIds || [],
          totalXp: parsed.totalXp || 0,
          trustTokens: parsed.trustTokens !== undefined ? parsed.trustTokens : 100,
          trustScore: parsed.trustScore !== undefined ? parsed.trustScore : 4.9,
        });
      }
    } catch (e) {
      // Ignore
    }
  },

  addTrustTokens: async (tokens: number, rating?: number) => {
    const { trustTokens, trustScore } = get();
    const newTokens = trustTokens + tokens;
    const newScore = rating ? Math.min(5.0, Number(((trustScore + rating) / 2).toFixed(1))) : trustScore;

    set({ trustTokens: newTokens, trustScore: newScore });

    try {
      const storedData = await AsyncStorage.getItem('@connify_reward_badges');
      const parsed = storedData ? JSON.parse(storedData) : {};
      await AsyncStorage.setItem(
        '@connify_reward_badges',
        JSON.stringify({ ...parsed, trustTokens: newTokens, trustScore: newScore })
      );
    } catch (err) {
      console.warn('Failed to save trust tokens:', err);
    }
  },

  unlockBadge: async (badgeId: string) => {
    const { unlockedBadgeIds, totalXp } = get();
    if (unlockedBadgeIds.includes(badgeId) || !ALL_BADGES[badgeId]) {
      return false; // Already unlocked
    }

    const badgeData = ALL_BADGES[badgeId];
    const newUnlocked = [...unlockedBadgeIds, badgeId];
    const newXp = totalXp + badgeData.xp;

    const fullBadge: BadgeItem = {
      ...badgeData,
      unlocked: true,
      unlockedAt: new Date().toISOString(),
    };

    set({
      unlockedBadgeIds: newUnlocked,
      totalXp: newXp,
      activeRewardModal: fullBadge,
    });

    try {
      const storedData = await AsyncStorage.getItem('@connify_reward_badges');
      const parsed = storedData ? JSON.parse(storedData) : {};
      await AsyncStorage.setItem(
        '@connify_reward_badges',
        JSON.stringify({ ...parsed, unlockedBadgeIds: newUnlocked, totalXp: newXp })
      );
    } catch (err) {
      console.warn('Failed to save reward badge:', err);
    }

    return true;
  },

  dismissRewardModal: () => {
    set({ activeRewardModal: null });
  },
}));

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'dark',
      toggleTheme: () => set((state) => ({ themeMode: state.themeMode === 'light' ? 'dark' : 'light' })),
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'connify-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

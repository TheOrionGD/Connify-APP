import React, { createContext, useContext } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { getThemeColors, darkColors } from './colors';
import { typography, fontFamilies } from './typography';
import { spacing } from './spacing';

export interface ThemeContextType {
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  colors: typeof darkColors;
  theme: {
    colors: typeof darkColors;
    typography: typeof typography;
    fontFamilies: typeof fontFamilies;
    spacing: typeof spacing;
  };
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { themeMode, toggleTheme, setThemeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);

  const value: ThemeContextType = {
    themeMode,
    toggleTheme,
    setThemeMode,
    colors,
    theme: {
      colors,
      typography,
      fontFamilies,
      spacing,
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    const { themeMode, toggleTheme, setThemeMode } = useThemeStore.getState();
    const colors = getThemeColors(themeMode);
    return {
      themeMode,
      toggleTheme,
      setThemeMode,
      colors,
      theme: {
        colors,
        typography,
        fontFamilies,
        spacing,
      },
    };
  }
  return context;
};

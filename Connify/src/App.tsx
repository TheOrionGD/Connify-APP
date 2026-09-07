import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, LinkingOptions, DefaultTheme, DarkTheme } from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider, useTheme } from './theme';
import RewardBadgeModal from './components/modals/RewardBadgeModal';
import { useRewardStore } from './stores/rewardStore';
import { widgetSyncService } from './widgets/widgetSyncService';

const linking: LinkingOptions<any> = {
  prefixes: ['connify://'],
  config: {
    screens: {
      Main: {
        screens: {
          Dashboard: 'home',
          Respond: 'nearby-help',
          SafetyHub: 'safety-hub',
          History: 'history',
          Settings: 'settings',
        },
      },
      CreateRequest: 'sos',
      EmergencyContacts: 'emergency-contacts',
    },
  },
};

function AppContent() {
  const { colors, themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surfaceContainerLowest,
      text: colors.onBackground,
      border: colors.outline,
      notification: colors.primary,
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <NavigationContainer
        theme={navigationTheme}
        linking={linking}
        onReady={() => {
          BootSplash.hide({ fade: true }).catch((err) => {
            console.warn('[BootSplash] Hide notice:', err);
          });
        }}
      >
        <AppNavigator />
        <RewardBadgeModal />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function App() {
  useEffect(() => {
    widgetSyncService.init();
    useRewardStore.getState().loadRewards();
    return () => {
      widgetSyncService.destroy();
    };
  }, []);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

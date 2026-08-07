import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './theme';

function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer onReady={() => BootSplash.hide({ fade: true })}>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

export default App;

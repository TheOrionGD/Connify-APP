import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';
import AppNavigator from './navigation/AppNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer onReady={() => BootSplash.hide({ fade: true })}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;

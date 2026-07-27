import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';

import SplashScreen from '../screens/Onboarding/SplashScreen';
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import DashboardScreen from '../screens/Requester/DashboardScreen';
import CreateRequestScreen from '../screens/Requester/CreateRequestScreen';
import SearchingScreen from '../screens/Requester/SearchingScreen';
import NearbyRequestsScreen from '../screens/Helper/NearbyRequestsScreen';
import HandshakeScreen from '../screens/Helper/HandshakeScreen';
import EmergencyScreen from '../screens/ActiveEpisode/EmergencyScreen';
import HistoryScreen from '../screens/Settings/HistoryScreen';
import GovernanceScreen from '../screens/Governance/GovernanceScreen';
import ProtocolExplainerScreen from '../screens/Governance/ProtocolExplainerScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import FeedbackScreen from '../screens/Feedback/FeedbackScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onBackground,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'help-outline';
          if (route.name === 'Dashboard') {
            iconName = 'shield';
          } else if (route.name === 'Respond') {
            iconName = 'explore';
          } else if (route.name === 'History') {
            iconName = 'history';
          } else if (route.name === 'Governance') {
            iconName = 'gavel';
          } else if (route.name === 'Settings') {
            iconName = 'person';
          }

          return (
            <View style={[styles.iconContainer, focused ? styles.iconContainerFocused : null]}>
              <Icon
                name={iconName}
                size={22}
                color={focused ? theme.colors.primary : theme.colors.onBackground}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'HOME' }}
      />
      <Tab.Screen
        name="Respond"
        component={NearbyRequestsScreen}
        options={{ tabBarLabel: 'RESPOND' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: 'HISTORY' }}
      />
      <Tab.Screen
        name="Governance"
        component={GovernanceScreen}
        options={{ tabBarLabel: 'GOVERNANCE' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'PROFILE' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
      <Stack.Screen name="Searching" component={SearchingScreen} />
      <Stack.Screen name="NearbyRequests" component={NearbyRequestsScreen} />
      <Stack.Screen name="Handshake" component={HandshakeScreen} />
      <Stack.Screen name="EmergencySOS" component={EmergencyScreen} />
      <Stack.Screen name="Governance" component={GovernanceScreen} />
      <Stack.Screen name="ProtocolExplainer" component={ProtocolExplainerScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.background,
    borderTopWidth: theme.spacing.borderWidthHeavy,
    borderTopColor: theme.colors.outline,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 0,
  },
  tabBarLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    marginTop: 2,
    fontWeight: '700',
  },
  iconContainer: {
    padding: 4,
    borderRadius: 8,
  },
  iconContainerFocused: {
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
});

export default AppNavigator;

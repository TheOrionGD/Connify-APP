import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../theme';

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
import EmergencyContactsScreen from '../screens/EmergencyContactsScreen';
import GovernmentEmergencyNumbersScreen from '../screens/GovernmentEmergencyNumbersScreen';
import WitnessContactsScreen from '../screens/Governance/WitnessContactsScreen';
import WomenSafetyScreen from '../screens/WomenSafetyScreen';
import OfflineEmergencyScreen from '../screens/OfflineEmergencyScreen';
import UnifiedSafetyHubScreen from '../screens/UnifiedSafetyHubScreen';
import FakeCallScreen from '../screens/FakeCallScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.outline,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIcon: ({ focused }) => {
          let iconName = 'help-outline';
          if (route.name === 'Dashboard') {
            iconName = 'shield';
          } else if (route.name === 'SafetyHub') {
            iconName = 'health-and-safety';
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
            <View
              style={[
                styles.iconContainer,
                focused ? { backgroundColor: colors.surfaceContainerHigh } : null,
              ]}
            >
              <Icon
                name={iconName}
                size={22}
                color={focused ? (route.name === 'SafetyHub' ? '#EC4899' : colors.primary) : colors.onSurfaceVariant}
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
        name="SafetyHub"
        component={UnifiedSafetyHubScreen}
        options={{ tabBarLabel: 'SAFETY' }}
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
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="GovernmentEmergencyNumbers" component={GovernmentEmergencyNumbersScreen} />
      <Stack.Screen name="WitnessContacts" component={WitnessContactsScreen} />
      <Stack.Screen name="WomenSafety" component={WomenSafetyScreen} />
      <Stack.Screen name="OfflineEmergency" component={OfflineEmergencyScreen} />
      <Stack.Screen name="UnifiedSafetyHub" component={UnifiedSafetyHubScreen} />
      <Stack.Screen 
        name="FakeCall" 
        component={FakeCallScreen} 
        options={{ presentation: 'fullScreenModal', animation: 'fade' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 8,
    letterSpacing: -0.2,
    marginTop: 2,
    fontWeight: '700',
  },
  tabBarItem: {
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  iconContainer: {
    padding: 4,
    borderRadius: 8,
  },
});

export default AppNavigator;

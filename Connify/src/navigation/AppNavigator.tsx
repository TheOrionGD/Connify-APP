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
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          borderRadius: 32,
          height: 64,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          paddingBottom: 0,
        },
        tabBarIcon: ({ focused }) => {
          let iconName = 'help-outline';
          let label = '';
          if (route.name === 'Dashboard') { 
            iconName = focused ? 'shield' : 'security'; 
            label = 'HOME'; 
          }
          else if (route.name === 'SafetyHub') { 
            iconName = focused ? 'health-and-safety' : 'healing'; 
            label = 'SAFETY'; 
          }
          else if (route.name === 'Respond') { 
            iconName = focused ? 'explore' : 'near-me'; 
            label = 'RESPOND'; 
          }
          else if (route.name === 'History') { 
            iconName = focused ? 'history' : 'access-time'; 
            label = 'HISTORY'; 
          }
          else if (route.name === 'Governance') { 
            iconName = focused ? 'gavel' : 'account-balance'; 
            label = 'GOVERN'; 
          }
          else if (route.name === 'Settings') { 
            iconName = focused ? 'person' : 'person-outline'; 
            label = 'PROFILE'; 
          }

          return (
            <View
              style={[
                styles.iconContainer,
                focused ? { backgroundColor: route.name === 'SafetyHub' ? '#EC489920' : colors.primary + '20', paddingHorizontal: 12, paddingVertical: 8 } : { padding: 8 },
              ]}
            >
              <Icon
                name={iconName}
                size={focused ? 24 : 22}
                color={focused ? (route.name === 'SafetyHub' ? '#EC4899' : colors.primary) : colors.onSurfaceVariant}
              />
              {focused && (
                <Text style={{ marginLeft: 6, color: route.name === 'SafetyHub' ? '#EC4899' : colors.primary, fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, fontWeight: '700' }}>
                  {label}
                </Text>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
      />
      <Tab.Screen
        name="SafetyHub"
        component={UnifiedSafetyHubScreen}
      />
      <Tab.Screen
        name="Respond"
        component={NearbyRequestsScreen}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
      />
      <Tab.Screen
        name="Governance"
        component={GovernanceScreen}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }} 
      initialRouteName="Splash"
    >
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});

export default AppNavigator;

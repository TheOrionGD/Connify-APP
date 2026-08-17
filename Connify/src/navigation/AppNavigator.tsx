import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
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

type TabBarIconProps = {
  focused: boolean;
  routeName: string;
  colors: any;
};

const TabBarIcon = ({ focused, routeName, colors }: TabBarIconProps) => {
  let iconName = 'help-outline';
  let label = '';
  if (routeName === 'Dashboard') { 
    iconName = focused ? 'shield' : 'security'; 
    label = 'HOME'; 
  }
  else if (routeName === 'SafetyHub') { 
    iconName = focused ? 'health-and-safety' : 'healing'; 
    label = 'SAFETY'; 
  }
  else if (routeName === 'Respond') { 
    iconName = focused ? 'explore' : 'near-me'; 
    label = 'RESPOND'; 
  }
  else if (routeName === 'History') { 
    iconName = focused ? 'history' : 'access-time'; 
    label = 'HISTORY'; 
  }
  else if (routeName === 'Governance') { 
    iconName = focused ? 'gavel' : 'account-balance'; 
    label = 'GOVERN'; 
  }
  else if (routeName === 'Settings') { 
    iconName = focused ? 'person' : 'person-outline'; 
    label = 'PROFILE'; 
  }

  const isSafetyHub = routeName === 'SafetyHub';
  const activeBgColor = isSafetyHub ? '#EC489920' : colors.primary + '20';
  const activeColor = isSafetyHub ? '#EC4899' : colors.primary;

  return (
    <View
      style={[
        styles.iconContainer,
        focused ? [styles.iconFocused, { backgroundColor: activeBgColor }] : styles.iconUnfocused,
      ]}
    >
      <Icon
        name={iconName}
        size={focused ? 24 : 22}
        color={focused ? activeColor : colors.onSurfaceVariant}
      />
      {focused && (
        <Text style={[styles.iconText, { color: activeColor }]}>
          {label}
        </Text>
      )}
    </View>
  );
};

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
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused} routeName={route.name} colors={colors} />
        ),
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
  iconFocused: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconUnfocused: {
    padding: 8,
  },
  iconText: {
    marginLeft: 6,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default AppNavigator;

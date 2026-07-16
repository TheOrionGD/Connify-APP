import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import DashboardScreen from '../screens/Requester/DashboardScreen';
import HistoryScreen from '../screens/Settings/HistoryScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import CreateRequestScreen from '../screens/Requester/CreateRequestScreen';
import SearchingScreen from '../screens/Requester/SearchingScreen';
import NearbyRequestsScreen from '../screens/Helper/NearbyRequestsScreen';
import FeedbackScreen from '../screens/Feedback/FeedbackScreen';
import EmergencyScreen from '../screens/ActiveEpisode/EmergencyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
      <Stack.Screen name="Searching" component={SearchingScreen} />
      <Stack.Screen name="NearbyRequests" component={NearbyRequestsScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="EmergencySOS" component={EmergencyScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigator;

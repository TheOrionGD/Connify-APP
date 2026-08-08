import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, useTheme } from '../theme';
import bundledNumbers from '../data/governmentEmergencyNumbers.json';
import { connectivityService } from '../services/ConnectivityService';

interface EmergencyNumbers {
  police: string;
  fire: string;
  ambulance: string;
  general: string;
  disaster?: string;
  women?: string;
  domestic?: string;
}

const SERVER_NUMBERS_URL = 'https://connify.app/api/data/emergency-numbers.json'; // hypothetical

export default function GovernmentEmergencyNumbersScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [countryCode, setCountryCode] = useState<string>('EU_DEFAULT');
  const [numbers, setNumbers] = useState<EmergencyNumbers>(bundledNumbers['EU_DEFAULT']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initNumbers();
  }, []);

  const initNumbers = async () => {
    try {
      // 1. Try to load cached remote JSON if it exists
      let dataMap: Record<string, EmergencyNumbers> = bundledNumbers;
      try {
        const cachedJson = await AsyncStorage.getItem('CACHED_GOV_NUMBERS');
        if (cachedJson) {
          dataMap = JSON.parse(cachedJson);
        }
      } catch (e) {
        // Fallback to bundled
      }

      // 2. Determine Country Code
      let activeCountry = 'EU_DEFAULT';
      try {
        const lastGeocode = await AsyncStorage.getItem('LAST_KNOWN_COUNTRY_CODE');
        if (lastGeocode) {
          activeCountry = lastGeocode;
        } else {
          // Fallback to device locale
          const localeCountry = RNLocalize.getCountry();
          if (localeCountry) activeCountry = localeCountry;
        }
      } catch (e) {}

      setCountryCode(activeCountry);

      // Select numbers for country, fallback to EU_DEFAULT
      const selectedNumbers = dataMap[activeCountry] || dataMap['EU_DEFAULT'] || bundledNumbers['EU_DEFAULT'];
      setNumbers(selectedNumbers);
      setLoading(false);

      // 3. Optional Background Sync if Online
      if (connectivityService.isOnline) {
        syncNumbersBackground();
      }

    } catch (e) {
      setLoading(false);
    }
  };

  const syncNumbersBackground = async () => {
    try {
      const res = await fetch(SERVER_NUMBERS_URL);
      if (res.ok) {
        const freshData = await res.json();
        await AsyncStorage.setItem('CACHED_GOV_NUMBERS', JSON.stringify(freshData));
      }
    } catch (e) {
      // Background sync failed, ignore silently
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Could not open dialer.'));
  };

  const renderCard = (title: string, number: string, icon: string, color: string) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}
      onPress={() => handleCall(number)}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={28} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.onSurfaceVariant }]}>{title}</Text>
        <Text style={[styles.cardNumber, { color }]}>{number}</Text>
      </View>
      <Icon name="phone" size={24} color={color} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.outline }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>GOVERNMENT EMERGENCY</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.titleSection}>
            <Text style={[styles.mainTitle, { color: colors.onBackground }]}>Local Authorities</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              Based on your detected location region: {countryCode}. Tap any number to call immediately via your cellular voice network (works offline without internet).
            </Text>
          </View>

          <View style={styles.grid}>
            {numbers.general && renderCard('General Emergency', numbers.general, 'warning', '#DC2626')}
            {numbers.women && renderCard('Women Helpline', numbers.women, 'health-and-safety', '#EC4899')}
            {numbers.domestic && renderCard('Domestic Violence Helpline', numbers.domestic, 'shield', '#8B5CF6')}
            {numbers.police && renderCard('Police', numbers.police, 'local-police', '#2563EB')}
            {numbers.ambulance && renderCard('Ambulance / Medical', numbers.ambulance, 'medical-services', '#059669')}
            {numbers.fire && renderCard('Fire Department', numbers.fire, 'local-fire-department', '#EA580C')}
            {numbers.disaster && renderCard('Disaster Response', numbers.disaster, 'storm', '#9333EA')}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    height: 56, borderBottomWidth: 1, borderBottomColor: theme.colors.outline,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16
  },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 13, letterSpacing: 1 },
  container: { padding: 16, gap: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titleSection: { gap: 6 },
  mainTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 22 },
  subtitle: { fontFamily: theme.fontFamilies.secondary.regular, fontSize: 13, color: '#666', lineHeight: 20 },
  grid: { gap: 12 },
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 12,
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center'
  },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: theme.fontFamilies.technical.medium, fontSize: 13, color: '#666' },
  cardNumber: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 22, marginTop: 2 },
});

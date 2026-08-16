import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../theme';
import { useLocationStore } from '../stores/locationStore';
import { connectivityService } from '../services/ConnectivityService';
import { offlineQueueService } from '../services/OfflineQueueService';
import { StandardButton } from '../components/buttons/StandardButton';
import bundledNumbers from '../data/governmentEmergencyNumbers.json';
import * as Keychain from 'react-native-keychain';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export default function OfflineEmergencyScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { latitude, longitude, startWatchingLocation, stopWatchingLocation } = useLocationStore();
  const [isOnline, setIsOnline] = useState(connectivityService.isOnline);
  const [queueCount, setQueueCount] = useState(0);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    startWatchingLocation();
    loadContacts();
    updateQueueCount();

    const unsub = connectivityService.subscribe((status) => {
      setIsOnline(status);
      if (status) {
        offlineQueueService.flushQueue();
      }
      updateQueueCount();
    });
    
    return () => {
      unsub();
      stopWatchingLocation();
    };
  }, []);

  const updateQueueCount = async () => {
    try {
      const q = await offlineQueueService.getQueue();
      setQueueCount(q.length);
    } catch {
      setQueueCount(0);
    }
  };

  const loadContacts = async () => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: 'CONNIFY_EMERGENCY_CONTACTS' });
      if (credentials) {
        setContacts(JSON.parse(credentials.password));
      }
    } catch (e) {
      console.warn('Failed to load contacts', e);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Could not open phone dialer.'));
  };

  const triggerOfflineSMSBroadcast = () => {
    if (contacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'No emergency contacts found in your trusted circle. Add contacts to send offline SMS alerts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Contacts', onPress: () => navigation.navigate('EmergencyContacts') },
        ]
      );
      return;
    }

    const mapsUrl = latitude && longitude
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : 'Location resolving...';

    const message = `EMERGENCY ALERT! I have no internet connection and need immediate assistance. My coordinates: ${mapsUrl}`;

    const recipientPhones = contacts.map(c => c.phone).join(',');
    Linking.openURL(`sms:${recipientPhones}?body=${encodeURIComponent(message)}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.outline }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
          NO NETWORK & OFFLINE HUB
        </Text>
        <Icon name="wifi-off" size={22} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Network Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: isOnline ? '#D1FAE5' : '#FEE2E2', borderColor: isOnline ? '#10B981' : '#EF4444' }]}>
          <Icon name={isOnline ? 'wifi' : 'wifi-off'} size={24} color={isOnline ? '#059669' : '#DC2626'} />
          <View style={styles.statusBannerTextGroup}>
            <Text style={[styles.statusBannerTitle, { color: isOnline ? '#065F46' : '#991B1B' }]}>
              {isOnline ? 'NETWORK ONLINE — CLOUD CONNECTED' : 'NO DATA NETWORK (OFFLINE MODE)'}
            </Text>
            <Text style={[styles.statusBannerSub, { color: isOnline ? '#047857' : '#B91C1C' }]}>
              {isOnline
                ? 'Your emergency broadcasts sync directly with nearby volunteer mesh servers.'
                : 'Cellular voice & SMS protocols are active for zero-network emergency communication.'}
            </Text>
          </View>
        </View>

        {/* Offline GPS Fix Card */}
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.cardHeader}>
            <Icon name="my-location" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onBackground }]}>On-Device GPS Fix (Offline)</Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.onSurfaceVariant }]}>
            GPS coordinates are resolved via satellite hardware on-device without internet access:
          </Text>
          <View style={[styles.geoBox, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.geoLabel, { color: colors.onBackground }]}>LATITUDE & LONGITUDE:</Text>
            <Text style={[styles.geoValue, { color: colors.primary }]}>
              {latitude !== null && longitude !== null && !(latitude === 0 && longitude === 0)
                ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
                : 'Acquiring GPS fix...'}
            </Text>
          </View>
        </View>

        {/* Cellular SMS Broadcast */}
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.cardHeader}>
            <Icon name="sms" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onBackground }]}>Cellular SMS Dispatcher</Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.onSurfaceVariant }]}>
            Transmit instant alert SMS containing live location coordinates link to your {contacts.length} registered emergency contact(s) using your mobile network plan.
          </Text>

          <StandardButton
            title="DISPATCH OFFLINE SMS ALERT"
            onPress={triggerOfflineSMSBroadcast}
            icon={<Icon name="send" size={18} color="#FFFFFF" />}
            style={{ marginTop: 6 }}
          />
        </View>

        {/* Offline Voice Dialers */}
        <Text style={[styles.sectionLabel, { color: colors.onBackground }]}>CELLULAR VOICE EMERGENCY HOTLINES</Text>

        <View style={styles.grid}>
          <TouchableOpacity style={[styles.dialerTile, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]} onPress={() => handleCall('112')}>
            <Icon name="warning" size={26} color="#DC2626" />
            <Text style={[styles.dialerTitle, { color: colors.onBackground }]}>General Emergency</Text>
            <Text style={[styles.dialerNumber, { color: '#DC2626' }]}>112</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dialerTile, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]} onPress={() => handleCall('1091')}>
            <Icon name="health-and-safety" size={26} color="#EC4899" />
            <Text style={[styles.dialerTitle, { color: colors.onBackground }]}>Women Helpline</Text>
            <Text style={[styles.dialerNumber, { color: '#EC4899' }]}>1091</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dialerTile, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]} onPress={() => handleCall('100')}>
            <Icon name="local-police" size={26} color="#2563EB" />
            <Text style={[styles.dialerTitle, { color: colors.onBackground }]}>Police Control</Text>
            <Text style={[styles.dialerNumber, { color: '#2563EB' }]}>100</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dialerTile, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]} onPress={() => handleCall('102')}>
            <Icon name="medical-services" size={26} color="#059669" />
            <Text style={[styles.dialerTitle, { color: colors.onBackground }]}>Medical Ambulance</Text>
            <Text style={[styles.dialerNumber, { color: '#059669' }]}>102</Text>
          </TouchableOpacity>
        </View>

        {/* Offline Queue Status */}
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.cardHeader}>
            <Icon name="cloud-queue" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onBackground }]}>Offline Sync Queue</Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.onSurfaceVariant }]}>
            Pending requests saved locally in secure device storage:
          </Text>
          <View style={[styles.queueBox, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.queueCount, { color: colors.primary }]}>{queueCount}</Text>
            <Text style={[styles.queueLabel, { color: colors.onBackground }]}>
              {queueCount === 1 ? 'Action queued to sync when online' : 'Actions queued to sync when online'}
            </Text>
          </View>
        </View>

        <StandardButton
          title="VIEW ALL GOVERNMENT NUMBERS"
          onPress={() => navigation.navigate('GovernmentEmergencyNumbers')}
          variant="secondary"
          style={{ marginTop: 4 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    height: 56,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  container: {
    padding: 16,
    gap: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
  },
  statusBannerTextGroup: { flex: 1 },
  statusBannerTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 13,
  },
  statusBannerSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 15,
  },
  cardSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  geoBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginTop: 2,
  },
  geoLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  geoValue: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 14,
  },
  sectionLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dialerTile: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  dialerTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 12,
    textAlign: 'center',
  },
  dialerNumber: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
  },
  queueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
  },
  queueCount: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 22,
  },
  queueLabel: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 12,
    flex: 1,
  },
});

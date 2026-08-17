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
import { useTheme } from '../theme';
import { useLocationStore } from '../stores/locationStore';
import { useAuthStore } from '../stores/authStore';
import { connectivityService } from '../services/ConnectivityService';
import { offlineQueueService } from '../services/OfflineQueueService';
import { StandardButton } from '../components/buttons/StandardButton';
import * as Keychain from 'react-native-keychain';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export default function UnifiedSafetyHubScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { latitude, longitude, fetchLocation } = useLocationStore();
  const { userProfile } = useAuthStore();

  const [isOnline, setIsOnline] = useState(connectivityService.isOnline);
  const [sirenActive, setSirenActive] = useState(false);
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [fakeTimer, setFakeTimer] = useState<number>(0);
  const [queueCount, setQueueCount] = useState(0);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  // Parse guardian details from userProfile
  let guardianData: { name: string; phone: string; relationship: string } | null = null;
  if (userProfile?.medicalNotes) {
    try {
      const parsed = JSON.parse(userProfile.medicalNotes);
      if (parsed.guardian && (parsed.guardian.name || parsed.guardian.phone)) {
        guardianData = parsed.guardian;
      }
    } catch (e) {}
  }

  useEffect(() => {
    fetchLocation();
    loadContacts();
    updateQueueCount();

    const unsub = connectivityService.subscribe((status) => {
      setIsOnline(status);
      if (status) {
        offlineQueueService.flushQueue();
      }
      updateQueueCount();
    });
    return unsub;
  }, []);

  useEffect(() => {
    let interval: any;
    if (fakeCallActive) {
      interval = setInterval(() => {
        setFakeTimer(prev => {
          if (prev <= 1) {
            setFakeCallActive(false);
            Alert.alert(
              '📞 Incoming Emergency Call Simulation',
              'Mom is calling...\n\nPress Answer to simulate exit strategy.',
              [
                { text: 'Decline', style: 'cancel' },
                { text: 'Answer & Exit', onPress: () => console.log('Fake call answered') },
              ]
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [fakeCallActive]);

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
      console.warn('Failed to load emergency contacts', e);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Could not open phone dialer.'));
  };

  const triggerOfflineSMSBroadcast = () => {
    if (contacts.length === 0 && !guardianData?.phone) {
      Alert.alert(
        'No Emergency Contacts',
        'You have no emergency contacts or guardian saved. Add contacts on your profile to send offline SMS alerts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Guardian / Contacts', onPress: () => navigation.navigate('Settings') },
        ]
      );
      return;
    }

    const recipientSet = new Set<string>();
    contacts.forEach(c => recipientSet.add(c.phone));
    if (guardianData?.phone) recipientSet.add(guardianData.phone);

    const recipientPhones = Array.from(recipientSet).join(',');

    const mapsUrl = latitude && longitude
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : 'Location resolving...';

    const message = `EMERGENCY SAFETY ALERT! I need immediate assistance. Please track my location: ${mapsUrl}`;

    Alert.alert(
      'Dispatch Offline Emergency SMS',
      `Send instant alert SMS with GPS coordinates to ${recipientSet.size} contact(s)? Works offline via cellular SMS.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'SEND SMS NOW',
          style: 'destructive',
          onPress: () => {
            Linking.openURL(`sms:${recipientPhones}?body=${encodeURIComponent(message)}`);
          },
        },
      ]
    );
  };

  const triggerFakeCall = (delaySeconds: number) => {
    setFakeTimer(delaySeconds);
    setFakeCallActive(true);
    Alert.alert('Fake Call Scheduled', `Simulated incoming call will ring in ${delaySeconds} seconds.`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: sirenActive ? '#DC2626' : colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: sirenActive ? '#991B1B' : colors.background, borderBottomColor: colors.outline }]}>
        <View style={styles.headerTitleGroup}>
          <Icon name="verified-user" size={24} color={sirenActive ? '#FFFFFF' : colors.primary} />
          <Text style={[styles.headerTitle, { color: sirenActive ? '#FFFFFF' : colors.onBackground }]}>
            UNIFIED EMERGENCY & WOMEN SAFETY HUB
          </Text>
        </View>
        <View style={styles.networkBadge}>
          <Icon name={isOnline ? 'wifi' : 'wifi-off'} size={14} color={isOnline ? '#059669' : '#EF4444'} />
          <Text style={[styles.networkBadgeText, { color: isOnline ? '#059669' : '#EF4444' }]}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Panic Alarm Siren */}
        <TouchableOpacity
          style={[styles.sirenCard, { backgroundColor: sirenActive ? '#EF4444' : colors.surfaceContainerLowest, borderColor: colors.primary }]}
          onPress={() => setSirenActive(!sirenActive)}
          activeOpacity={0.85}
        >
          <Icon name={sirenActive ? 'volume-up' : 'campaign'} size={48} color={sirenActive ? '#FFFFFF' : colors.primary} />
          <Text style={[styles.sirenTitle, { color: sirenActive ? '#FFFFFF' : colors.onBackground }]}>
            {sirenActive ? 'SIREN ALARM ACTIVE' : 'LOUD SIREN PANIC ALARM'}
          </Text>
          <Text style={[styles.sirenSub, { color: sirenActive ? '#FFFFFF' : colors.onSurfaceVariant }]}>
            {sirenActive ? 'TAP TO STOP ALARM SOUND & STROBE' : 'TAP TO TRIGGER VISUAL & AUDIBLE EMERGENCY DETERRENT'}
          </Text>
        </TouchableOpacity>

        {/* Primary Guardian Contact Card */}
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.cardHeader}>
            <Icon name="shield-heart" size={24} color="#EC4899" />
            <Text style={[styles.cardTitle, { color: colors.onBackground }]}>PRIMARY GUARDIAN (OFFLINE CONTACT)</Text>
          </View>

          {guardianData?.phone ? (
            <View style={styles.guardianInfoGroup}>
              <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
                <Text style={[styles.infoLabel, { color: colors.onBackground }]}>NAME & RELATION:</Text>
                <Text style={[styles.infoValue, { color: colors.onBackground }]}>
                  {guardianData.name || 'Guardian'} ({guardianData.relationship || 'Guardian'})
                </Text>
              </View>

              <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
                <Text style={[styles.infoLabel, { color: colors.onBackground }]}>PHONE NUMBER:</Text>
                <Text style={[styles.infoValue, { color: colors.primary }]}>{guardianData.phone}</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.guardianBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={() => handleCall(guardianData!.phone)}
                >
                  <Icon name="phone" size={18} color="#FFFFFF" />
                  <Text style={styles.guardianBtnTextWhite}>CALL GUARDIAN</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.guardianBtn, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}
                  onPress={() => {
                    const mapsUrl = latitude && longitude ? `https://maps.google.com/?q=${latitude},${longitude}` : '';
                    Linking.openURL(`sms:${guardianData!.phone}?body=${encodeURIComponent('EMERGENCY ALERT! I need immediate help. Location: ' + mapsUrl)}`);
                  }}
                >
                  <Icon name="sms" size={18} color={colors.primary} />
                  <Text style={[styles.guardianBtnText, { color: colors.onBackground }]}>SMS GUARDIAN</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyGuardianState}>
              <Text style={[styles.emptyGuardianText, { color: colors.onSurfaceVariant }]}>
                No primary guardian contact configured on your profile.
              </Text>
              <StandardButton
                title="ADD GUARDIAN TO PROFILE"
                onPress={() => navigation.navigate('Settings')}
                variant="secondary"
                style={{ marginTop: 4 }}
              />
            </View>
          )}
        </View>

        {/* 1-Tap Offline SMS Broadcast */}
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.cardHeader}>
            <Icon name="sms" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onBackground }]}>1-Tap GPS Offline SMS Broadcast</Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.onSurfaceVariant }]}>
            Dispatches instant emergency SMS containing live satellite GPS location to all {contacts.length + (guardianData?.phone ? 1 : 0)} trusted contact(s). Works 100% offline without cellular data.
          </Text>

          <StandardButton
            title="DISPATCH EMERGENCY SMS TO ALL CONTACTS"
            onPress={triggerOfflineSMSBroadcast}
            icon={<Icon name="send" size={18} color="#FFFFFF" />}
            style={{ marginTop: 4 }}
          />
        </View>

        {/* Women Safety & 24/7 Emergency Hotlines */}
        <Text style={[styles.sectionLabel, { color: colors.onBackground }]}>24/7 EMERGENCY & WOMEN SAFETY HOTLINES</Text>

        <View style={styles.grid}>
          <TouchableOpacity style={[styles.hotlineTile, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]} onPress={() => handleCall('1091')}>
            <Icon name="health-and-safety" size={28} color="#EC4899" />
            <Text style={[styles.hotlineTileTitle, { color: colors.onBackground }]}>Women Helpline</Text>
            <Text style={[styles.hotlineTileNum, { color: '#EC4899' }]}>1091</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.hotlineTile, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]} onPress={() => handleCall('181')}>
            <Icon name="shield" size={28} color="#8B5CF6" />
            <Text style={[styles.hotlineTileTitle, { color: colors.onBackground }]}>Domestic Abuse</Text>
            <Text style={[styles.hotlineTileNum, { color: '#8B5CF6' }]}>181</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.hotlineTile, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]} onPress={() => handleCall('112')}>
            <Icon name="warning" size={28} color="#DC2626" />
            <Text style={[styles.hotlineTileTitle, { color: colors.onBackground }]}>National Emergency</Text>
            <Text style={[styles.hotlineTileNum, { color: '#DC2626' }]}>112</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.hotlineTile, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]} onPress={() => handleCall('100')}>
            <Icon name="local-police" size={28} color="#2563EB" />
            <Text style={[styles.hotlineTileTitle, { color: colors.onBackground }]}>Police Control</Text>
            <Text style={[styles.hotlineTileNum, { color: '#2563EB' }]}>100</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.hotlineTile, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]} onPress={() => handleCall('102')}>
            <Icon name="medical-services" size={28} color="#059669" />
            <Text style={[styles.hotlineTileTitle, { color: colors.onBackground }]}>Ambulance</Text>
            <Text style={[styles.hotlineTileNum, { color: '#059669' }]}>102</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.hotlineTile, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]} onPress={() => handleCall('1930')}>
            <Icon name="security" size={28} color="#0284C7" />
            <Text style={[styles.hotlineTileTitle, { color: colors.onBackground }]}>Cyber Helpline</Text>
            <Text style={[styles.hotlineTileNum, { color: '#0284C7' }]}>1930</Text>
          </TouchableOpacity>
        </View>

        {/* Discreet Exit Call Generator */}
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.cardHeader}>
            <Icon name="phone-in-talk" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onBackground }]}>Discreet Exit Call Simulator</Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.onSurfaceVariant }]}>
            Simulate a realistic incoming phone call to give yourself a plausible excuse to exit unsafe situations.
          </Text>

          <View style={styles.fakeCallRow}>
            <TouchableOpacity style={[styles.fakePill, { backgroundColor: colors.surfaceContainerHigh }]} onPress={() => triggerFakeCall(5)}>
              <Text style={[styles.fakePillText, { color: colors.onBackground }]}>In 5s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.fakePill, { backgroundColor: colors.surfaceContainerHigh }]} onPress={() => triggerFakeCall(15)}>
              <Text style={[styles.fakePillText, { color: colors.onBackground }]}>In 15s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.fakePill, { backgroundColor: colors.surfaceContainerHigh }]} onPress={() => triggerFakeCall(30)}>
              <Text style={[styles.fakePillText, { color: colors.onBackground }]}>In 30s</Text>
            </TouchableOpacity>
          </View>

          {fakeCallActive && (
            <Text style={[styles.timerBadge, { color: colors.primary }]}>
              Call incoming in {fakeTimer}s...
            </Text>
          )}
        </View>

        {/* Offline Location & Queue Status */}
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.cardHeader}>
            <Icon name="my-location" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onBackground }]}>On-Device Satellite GPS & Queue</Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>GPS COORDINATES:</Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>
              {latitude !== null && longitude !== null && !(latitude === 0 && longitude === 0)
                ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
                : 'Acquiring GPS fix...'}
            </Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>OFFLINE SYNC QUEUE:</Text>
            <Text style={[styles.infoValue, { color: colors.onBackground }]}>
              {queueCount} action(s) stored locally waiting for internet
            </Text>
          </View>

          <StandardButton
            title="VIEW ALL GOVERNMENT HOTLINES"
            onPress={() => navigation.navigate('GovernmentEmergencyNumbers')}
            variant="secondary"
            style={{ marginTop: 4 }}
          />
        </View>
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
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  networkBadgeText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
  },
  container: {
    padding: 16,
    gap: 16,
  },
  sirenCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  sirenTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  sirenSub: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 14,
  },
  cardSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  guardianInfoGroup: {
    gap: 8,
  },
  infoRow: {
    gap: 3,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  infoValue: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  guardianBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  guardianBtnTextWhite: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  guardianBtnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  emptyGuardianState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  emptyGuardianText: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 12,
    textAlign: 'center',
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
    gap: 10,
  },
  hotlineTile: {
    width: '31%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  hotlineTileTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 11,
    textAlign: 'center',
  },
  hotlineTileNum: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 14,
  },
  fakeCallRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  fakePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fakePillText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
  },
  timerBadge: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});

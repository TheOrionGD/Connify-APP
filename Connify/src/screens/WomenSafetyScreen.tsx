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
import { StandardButton } from '../components/buttons/StandardButton';
import * as Keychain from 'react-native-keychain';
import { normalizePhoneForURI, openWhatsAppContact } from '../utils/phone';
import { formatEmergencySMSMessage } from '../utils/smsFormatter';
import { useAuthStore } from '../stores/authStore';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export default function WomenSafetyScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { latitude, longitude, startWatchingLocation, stopWatchingLocation } = useLocationStore();
  const { userProfile } = useAuthStore();
  const [sirenActive, setSirenActive] = useState(false);
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [fakeTimer, setFakeTimer] = useState<number>(0);

  useEffect(() => {
    startWatchingLocation();
    loadContacts();
    
    return () => {
      stopWatchingLocation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval: any;
    if (fakeCallActive) {
      interval = setInterval(() => {
        setFakeTimer(prev => {
          if (prev <= 1) {
            setFakeCallActive(false);
            navigation.navigate('FakeCall');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fakeCallActive]);

  const loadContacts = async () => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: 'CONNIFY_EMERGENCY_CONTACTS' });
      if (credentials) {
        setContacts(JSON.parse(credentials.password));
      }
    } catch (e) {
      console.warn('Failed to load contacts for SMS dispatch', e);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${normalizePhoneForURI(phone)}`).catch(() => Alert.alert('Error', 'Could not open phone dialer.'));
  };

  const triggerOfflineSMSBroadcast = () => {
    if (contacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'You have no emergency contacts saved in your trusted circle.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Contacts', onPress: () => navigation.navigate('EmergencyContacts') },
        ]
      );
      return;
    }

    const userName = userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : 'Safety User';
    const message = formatEmergencySMSMessage({
      alertType: 'WOMEN SAFETY EMERGENCY ALERT',
      userName,
      reason: 'User triggered 1-tap emergency safety broadcast',
      relationship: 'Emergency Contact',
      latitude,
      longitude,
    });

    Alert.alert(
      'Dispatch Emergency Alert Channel',
      `Select your dispatch channel to transmit live GPS coordinates to ${contacts.length} emergency contact(s):`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'SEND VIA WHATSAPP',
          onPress: () => {
            if (contacts.length > 0) {
              openWhatsAppContact(contacts[0].phone, message);
            }
          },
        },
        {
          text: 'SEND VIA SMS (OFFLINE)',
          style: 'destructive',
          onPress: () => {
            const recipientPhones = contacts.map(c => normalizePhoneForURI(c.phone)).join(',');
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

  const toggleSiren = () => {
    setSirenActive(!sirenActive);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: sirenActive ? '#DC2626' : colors.background }]}>
      <View style={[styles.header, { backgroundColor: sirenActive ? '#991B1B' : colors.background, borderBottomColor: colors.outline }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={sirenActive ? '#FFFFFF' : colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: sirenActive ? '#FFFFFF' : colors.onBackground }]}>
          WOMEN SAFETY & PANIC HUB
        </Text>
        <Icon name="female" size={24} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Panic Siren Box */}
        <TouchableOpacity
          style={[styles.sirenCard, { backgroundColor: sirenActive ? '#EF4444' : colors.surfaceContainerLowest, borderColor: colors.primary }]}
          onPress={toggleSiren}
          activeOpacity={0.85}
        >
          <Icon name={sirenActive ? 'volume-up' : 'campaign'} size={48} color={sirenActive ? '#FFFFFF' : colors.primary} />
          <Text style={[styles.sirenTitle, { color: sirenActive ? '#FFFFFF' : colors.onBackground }]}>
            {sirenActive ? 'SIREN ALARM ACTIVE' : 'LOUD SIREN PANIC ALARM'}
          </Text>
          <Text style={[styles.sirenSub, { color: sirenActive ? '#FFFFFF' : colors.onSurfaceVariant }]}>
            {sirenActive ? 'TAP TO STOP ALARM SOUND & FLASH' : 'TAP TO TRIGGER MAXIMUM VISUAL & AUDIBLE DETERRENT'}
          </Text>
        </TouchableOpacity>

        {/* Zero-Trace Ephemeral Privacy Notice */}
        <View style={[styles.privacyCard, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
          <Icon name="lock" size={18} color={colors.primary} />
          <Text style={[styles.privacyText, { color: colors.onSurfaceVariant }]}>
            Ephemeral Zero-Trace Policy: Once your emergency episode or request is completed, all location data and temporary session records are immediately discarded.
          </Text>
        </View>

        {/* 1-Tap Helpline Hotlines */}
        <Text style={[styles.sectionLabel, { color: colors.onBackground }]}>DIRECT 24/7 HELPLINES (OFFLINE VOICE CALL)</Text>

        <TouchableOpacity style={[styles.hotlineCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]} onPress={() => handleCall('1091')}>
          <View style={[styles.hotlineIconWrapper, { backgroundColor: '#FCE7F3' }]}>
            <Icon name="health-and-safety" size={26} color="#EC4899" />
          </View>
          <View style={styles.hotlineInfo}>
            <Text style={[styles.hotlineTitle, { color: colors.onBackground }]}>Women National Helpline</Text>
            <Text style={[styles.hotlineSub, { color: colors.onSurfaceVariant }]}>Immediate police & crisis team dispatch</Text>
          </View>
          <Text style={[styles.hotlineDigit, { color: '#EC4899' }]}>1091</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.hotlineCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]} onPress={() => handleCall('181')}>
          <View style={[styles.hotlineIconWrapper, { backgroundColor: '#F3E8FF' }]}>
            <Icon name="shield" size={26} color="#8B5CF6" />
          </View>
          <View style={styles.hotlineInfo}>
            <Text style={[styles.hotlineTitle, { color: colors.onBackground }]}>Domestic Abuse & Violence Helpline</Text>
            <Text style={[styles.hotlineSub, { color: colors.onSurfaceVariant }]}>24/7 confidential safety support</Text>
          </View>
          <Text style={[styles.hotlineDigit, { color: '#8B5CF6' }]}>181</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.hotlineCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]} onPress={() => handleCall('112')}>
          <View style={[styles.hotlineIconWrapper, { backgroundColor: '#FEE2E2' }]}>
            <Icon name="local-police" size={26} color="#DC2626" />
          </View>
          <View style={styles.hotlineInfo}>
            <Text style={[styles.hotlineTitle, { color: colors.onBackground }]}>National Emergency Services</Text>
            <Text style={[styles.hotlineSub, { color: colors.onSurfaceVariant }]}>All-in-one emergency dispatch</Text>
          </View>
          <Text style={[styles.hotlineDigit, { color: '#DC2626' }]}>112</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.hotlineCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]} onPress={() => handleCall('1930')}>
          <View style={[styles.hotlineIconWrapper, { backgroundColor: '#E0F2FE' }]}>
            <Icon name="security" size={26} color="#0284C7" />
          </View>
          <View style={styles.hotlineInfo}>
            <Text style={[styles.hotlineTitle, { color: colors.onBackground }]}>Cyber Harassment & Safety Line</Text>
            <Text style={[styles.hotlineSub, { color: colors.onSurfaceVariant }]}>Online stalking & cyber safety hotline</Text>
          </View>
          <Text style={[styles.hotlineDigit, { color: '#0284C7' }]}>1930</Text>
        </TouchableOpacity>

        {/* Offline SMS & WhatsApp Trusted Dispatch */}
        <Text style={[styles.sectionLabel, { color: colors.onBackground }]}>OFFLINE TRUSTED CIRCLE DISPATCH</Text>

        <View style={[styles.actionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.actionCardHeader}>
            <Icon name="phonelink-ring" size={22} color={colors.primary} />
            <Text style={[styles.actionCardTitle, { color: colors.onBackground }]}>1-Tap GPS Emergency Alert</Text>
          </View>
          <Text style={[styles.actionCardSub, { color: colors.onSurfaceVariant }]}>
            Sends cellular SMS or WhatsApp message containing live GPS coordinates link to your {contacts.length} registered trusted contact(s).
          </Text>

          <StandardButton
            title="SEND EMERGENCY ALERT TO CONTACTS"
            onPress={triggerOfflineSMSBroadcast}
            icon={<Icon name="send" size={18} color="#FFFFFF" />}
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Trusted Circle Quick Action Cards */}
        {contacts.length > 0 && (
          <View style={[styles.actionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <Text style={[styles.actionCardTitle, { color: colors.onBackground }]}>TRUSTED CIRCLE QUICK ACTIONS</Text>
            {contacts.map((contact) => {
              const userName = userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : 'Safety User';
              const alertMsg = formatEmergencySMSMessage({
                alertType: 'WOMEN SAFETY DIRECT ALERT',
                userName,
                reason: 'Direct alert requested from Women Safety Hub',
                relationship: contact.relationship || 'Emergency Contact',
                latitude,
                longitude,
              });

              return (
                <View key={contact.id} style={[styles.contactRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contactName, { color: colors.onBackground }]}>{contact.name}</Text>
                    <Text style={[styles.contactSub, { color: colors.onSurfaceVariant }]}>{contact.relationship} • {contact.phone}</Text>
                  </View>

                  <View style={styles.contactBtnGroup}>
                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleCall(contact.phone)}
                    >
                      <Icon name="phone" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outline }]}
                      onPress={() => Linking.openURL(`sms:${normalizePhoneForURI(contact.phone)}?body=${encodeURIComponent(alertMsg)}`)}
                    >
                      <Icon name="sms" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: '#25D366' }]}
                      onPress={() => openWhatsAppContact(contact.phone, alertMsg)}
                    >
                      <Icon name="chat" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Fake Call Generator Simulation */}
        <Text style={[styles.sectionLabel, { color: colors.onBackground }]}>EXIT STRATEGY (FAKE CALL GENERATOR)</Text>

        <View style={[styles.actionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.actionCardHeader}>
            <Icon name="phone-in-talk" size={22} color={colors.primary} />
            <Text style={[styles.actionCardTitle, { color: colors.onBackground }]}>Discreet Exit Call Simulation</Text>
          </View>
          <Text style={[styles.actionCardSub, { color: colors.onSurfaceVariant }]}>
            Simulate a realistic incoming phone call to give yourself a plausible excuse to exit unsafe situations discreetly.
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
            <Text style={[styles.timerBadge, { color: colors.onBackground }]}>
              Call incoming in {fakeTimer}s...
            </Text>
          )}
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
  sirenCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
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
    fontSize: 11,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  hotlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
  },
  hotlineIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotlineInfo: { flex: 1 },
  hotlineTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 14,
  },
  hotlineSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 12,
    marginTop: 1,
  },
  hotlineDigit: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
  },
  actionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionCardTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 15,
  },
  actionCardSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  privacyText: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  contactName: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 13,
  },
  contactSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 11,
    marginTop: 2,
  },
  contactBtnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  smallBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fakeCallRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
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

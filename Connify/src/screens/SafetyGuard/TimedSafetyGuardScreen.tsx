import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, useTheme } from '../../theme';
import { safetyGuardService, ActiveSafetyTimer } from '../../services/safetyGuardService';

export default function TimedSafetyGuardScreen({ navigation }: any) {
  const { colors } = useTheme();

  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState<number>(15);
  const [activeTimer, setActiveTimer] = useState<ActiveSafetyTimer | null>(null);
  const [remainingSecs, setRemainingSecs] = useState<number>(0);

  useEffect(() => {
    const existing = safetyGuardService.getActiveTimer();
    if (existing && existing.isActive) {
      setActiveTimer(existing);
      setRemainingSecs(existing.remainingSeconds);
    }
  }, []);

  const handleStart = () => {
    if (!destination.trim()) {
      Alert.alert('Destination Required', 'Please specify your target destination (e.g. Home, Apartment, Parking Lot).');
      return;
    }

    const timer = safetyGuardService.startGuardTimer(
      destination.trim(),
      duration,
      (rem) => setRemainingSecs(rem),
      () => {
        Alert.alert(
          'SAFETY ALERT TRIGGERED!',
          'Safety Guard countdown expired. Automatic SMS & push alerts dispatched to your emergency network.',
          [{ text: 'OK' }]
        );
        setActiveTimer(null);
      }
    );

    setActiveTimer(timer);
    setRemainingSecs(duration * 60);
  };

  const handleCheckIn = () => {
    safetyGuardService.checkInSafely();
    setActiveTimer(null);
    Alert.alert('Check-In Verified', 'Glad you arrived safely! Your quiet timer has been deactivated.');
  };

  const formatTimerStr = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>Quiet Timed Safety Guard</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={[styles.bannerCard, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
          <Icon name="timer" size={28} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: colors.onBackground }]}>Automated Journey Guard</Text>
            <Text style={[styles.bannerSub, { color: colors.onSurfaceVariant }]}>
              Set a timer when walking home or taking a taxi. If you don't check in before it expires, emergency contacts are alerted automatically.
            </Text>
          </View>
        </View>

        {activeTimer && activeTimer.isActive ? (
          /* Active Countdown Display */
          <View style={[styles.activeCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.primary }]}>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Icon name="alarm" size={40} color={colors.primary} />
              <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 11, color: colors.primary, letterSpacing: 1.5 }}>
                SAFETY GUARD ACTIVE
              </Text>
              <Text style={[styles.countdownText, { color: colors.onBackground }]}>{formatTimerStr(remainingSecs)}</Text>
              <Text style={{ fontFamily: theme.fontFamilies.secondary.medium, fontSize: 13, color: colors.onSurfaceVariant }}>
                Destination: {activeTimer.destination}
              </Text>
            </View>

            <TouchableOpacity onPress={handleCheckIn} style={[styles.checkInBtn, { backgroundColor: '#10B981' }]}>
              <Icon name="check-circle" size={22} color="#FFFFFF" />
              <Text style={styles.checkInBtnText}>I ARRIVED SAFELY (CHECK IN)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                safetyGuardService.cancelGuardTimer();
                setActiveTimer(null);
              }}
              style={{ paddingVertical: 8, alignItems: 'center' }}
            >
              <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 12, color: colors.onSurfaceVariant }}>
                CANCEL GUARD TIMER
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Setup Form */
          <View style={[styles.formCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <Text style={[styles.formTitle, { color: colors.onBackground }]}>Configure Journey Guard</Text>

            <Text style={styles.inputLabel}>TARGET DESTINATION</Text>
            <TextInput
              style={[styles.input, { color: colors.onBackground, borderColor: colors.outline }]}
              placeholder="e.g. Home, Hostel, Parking Garage, Metro Station"
              placeholderTextColor={colors.onSurfaceVariant}
              value={destination}
              onChangeText={setDestination}
            />

            <Text style={styles.inputLabel}>ESTIMATED JOURNEY TIME</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[10, 15, 20, 30, 45, 60].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  onPress={() => setDuration(mins)}
                  style={[
                    styles.timeChip,
                    {
                      backgroundColor: duration === mins ? colors.primary : colors.surfaceVariant,
                      borderColor: duration === mins ? colors.primary : colors.outline,
                    },
                  ]}
                >
                  <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 12, color: duration === mins ? '#FFFFFF' : colors.onBackground }}>
                    {mins}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleStart} style={[styles.startBtn, { backgroundColor: colors.primary }]}>
              <Icon name="play-arrow" size={24} color="#FFFFFF" />
              <Text style={styles.startBtnText}>ACTIVATE SAFETY TIMER</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#33333333',
  },
  iconBtn: { padding: 8 },
  headerTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 18 },
  scrollContent: { padding: 16, gap: 16 },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  bannerTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 14 },
  bannerSub: { fontFamily: theme.fontFamilies.secondary.regular, fontSize: 12, marginTop: 2 },
  formCard: { padding: 18, borderRadius: 16, borderWidth: 1, gap: 14 },
  formTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 16 },
  inputLabel: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 10, letterSpacing: 1 },
  input: { height: 46, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, fontFamily: theme.fontFamilies.secondary.regular, fontSize: 13 },
  timeChip: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  startBtnText: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 14, color: '#FFFFFF', letterSpacing: 1 },
  activeCard: { padding: 24, borderRadius: 20, borderWidth: 2, gap: 20, alignItems: 'center' },
  countdownText: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 44, letterSpacing: 2 },
  checkInBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', paddingVertical: 16, borderRadius: 12 },
  checkInBtnText: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 15, color: '#FFFFFF', letterSpacing: 1 },
});

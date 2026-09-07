import React, { useState } from 'react';
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
import { theme, useTheme } from '../../theme';
import { StandardButton } from '../../components/buttons/StandardButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useEpisodeStore } from '../../stores/episodeStore';
import { episodeApi } from '../../services/api/episodeApi';
import { BloomFilter, SHARPHelper } from '../../utils/sharp';
import { useLocationStore } from '../../stores/locationStore';
import { connectivityService } from '../../services/ConnectivityService';
import { offlineQueueService } from '../../services/OfflineQueueService';
import { NotificationService } from '../../services/NotificationService';
import { useRewardStore } from '../../stores/rewardStore';
import { useFrequentLocationsStore } from '../../stores/frequentLocationsStore';


import { CategoryType } from '../../stores/episodeStore';

import { BiometricService } from '../../services/biometricService';

export default function CreateRequestScreen({ navigation }: any) {
  const { colors } = useTheme();
  const startRequest = useEpisodeStore((state) => state.startRequest);
  const { latitude, longitude } = useLocationStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>('General Request');
  const [urgency, setUrgency] = useState<number>(3);
  const [context, setContext] = useState('I need immediate assistance at my current location.');
  const [loading, setLoading] = useState(false);

  const categories: { name: CategoryType; icon: string; description: string }[] = [
    { name: 'Medical Emergency', icon: 'medical-services', description: 'Urgent medical aid, trauma, or cardiac emergency' },
    { name: 'Security & Assault', icon: 'security', description: 'Physical threat, active assault, or immediate danger' },
    { name: 'Fire & Explosion', icon: 'local-fire-department', description: 'Active fire outbreak, smoke, or explosion hazard' },
    { name: 'Women Safety & Harassment', icon: 'health-and-safety', description: 'SOS panic, stalking, or female safety intervention' },
    { name: 'Accident & Collision', icon: 'car-crash', description: 'Road crash, vehicular accident, or injury on transit' },
    { name: 'Transport & Evacuation', icon: 'local-taxi', description: 'Emergency transport, ambulance, or safe evacuation' },
    { name: 'Disaster & Flood', icon: 'thunderstorm', description: 'Flash flood, storm, earthquake, or severe hazard' },
    { name: 'Domestic Violence & Abuse', icon: 'gavel', description: 'Domestic abuse, violent dispute, or protective distress' },
    { name: 'Child Emergency & Lost', icon: 'child-care', description: 'Missing child, infant distress, or pediatric emergency' },
    { name: 'Senior Citizen Assist', icon: 'elderly', description: 'Elderly fall, confusion, or senior assistance' },
    { name: 'Mental Health Crisis', icon: 'psychology', description: 'Severe distress, panic attack, or psychological aid' },
    { name: 'Stranded & Breakdown', icon: 'build', description: 'Vehicle breakdown, flat tire, or isolated location' },
    { name: 'Blood & Organ Need', icon: 'bloodtype', description: 'Urgent blood donor requirement or rare group need' },
    { name: 'Oxygen & Med Supply', icon: 'vaccines', description: 'Critical oxygen cylinder or lifesaving medication' },
    { name: 'Cyber Threat & Stalking', icon: 'phishing', description: 'Digital harassment, blackmail, or cyber stalking' },
    { name: 'Animal Rescue & Hazard', icon: 'pets', description: 'Injured animal, rabid hazard, or wildlife rescue' },
    { name: 'Power Grid & Blackout', icon: 'power-off', description: 'Complete power failure, grid blackout, or electrical hazard' },
    { name: 'Gas & Chemical Leak', icon: 'warning-amber', description: 'Toxic gas leak, chemical spill, or gas cylinder hazard' },
    { name: 'Theft & Burglary', icon: 'lock', description: 'Active break-in, theft, robbery, or property intrusion' },
    { name: 'Food & Water Crisis', icon: 'set-meal', description: 'Emergency food, clean water shortage, or relief' },
    { name: 'Shelter & Homeless Relief', icon: 'night-shelter', description: 'Extreme weather shelter, displacement, or emergency bed' },
    { name: 'General Request', icon: 'report-problem', description: 'General community assistance or unlisted distress' },
  ];

  const urgencyLabels = ['Low', 'Minor', 'Standard', 'High', 'Critical'];

  const handleBroadcast = async () => {
    if (!selectedCategory) {
      Alert.alert('Category Required', 'Please select an emergency category before broadcasting.');
      return;
    }

    if (latitude === null || longitude === null || (latitude === 0 && longitude === 0)) {
      Alert.alert('Location Required', 'Acquiring high-accuracy GPS fix. Please wait a moment before broadcasting.');
      return;
    }

    // Biometric verification before broadcasting emergency episode
    const authenticated = await BiometricService.authenticateForEpisode('Broadcast Help Request');
    if (!authenticated) {
      return;
    }

    setLoading(true);
    try {
      const categoryMapping: Record<CategoryType, 'medical' | 'transport' | 'general' | 'emergency'> = {
        'Medical': 'medical',
        'Security': 'emergency',
        'Fire & Hazard': 'emergency',
        'Transport': 'transport',
        'Disaster': 'emergency',
        'Women Safety': 'emergency',
        'Child Care': 'general',
        'Accident': 'medical',
        'Animal Rescue': 'general',
        'Senior Assist': 'general',
        'Blackout': 'general',
        'Medical Emergency': 'medical',
        'Security & Assault': 'emergency',
        'Fire & Explosion': 'emergency',
        'Women Safety & Harassment': 'emergency',
        'Accident & Collision': 'medical',
        'Transport & Evacuation': 'transport',
        'Disaster & Flood': 'emergency',
        'Domestic Violence & Abuse': 'emergency',
        'Child Emergency & Lost': 'general',
        'Senior Citizen Assist': 'general',
        'Mental Health Crisis': 'medical',
        'Stranded & Breakdown': 'general',
        'Blood & Organ Need': 'medical',
        'Oxygen & Med Supply': 'medical',
        'Cyber Threat & Stalking': 'general',
        'Animal Rescue & Hazard': 'general',
        'Power Grid & Blackout': 'general',
        'Gas & Chemical Leak': 'emergency',
        'Theft & Burglary': 'emergency',
        'Food & Water Crisis': 'general',
        'Shelter & Homeless Relief': 'general',
        'General Request': 'general',
      };
      const apiCategory = categoryMapping[selectedCategory];

      const lat = latitude;
      const lng = longitude;

      // Generate dynamic signals from coordinates rounded to 3 decimal places
      const getGridSignals = (lati: number, longi: number): string[] => {
        const sigs: string[] = [];
        const latR = Math.round(lati * 1000) / 1000;
        const lngR = Math.round(longi * 1000) / 1000;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const cellLat = (latR + dx * 0.001).toFixed(3);
            const cellLng = (lngR + dy * 0.001).toFixed(3);
            sigs.push(`beacon_${cellLat}_${cellLng}`);
          }
        }
        return sigs;
      };

      const signals = getGridSignals(lat, lng);
      const bloom = new BloomFilter(1024, 4);
      signals.forEach(sig => bloom.add(sig));

      const sessionKey = Math.random().toString(36).substring(2, 10);
      const syndromes = SHARPHelper.generateSyndromes(bloom.getBits());

      // Generate grid cell and its 8 neighbors for boundary match robustness
      const cellX = Math.floor(lat * 100);
      const cellY = Math.floor(lng * 100);
      const gridCells: string[] = [];
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const cellStr = `grid_${cellX + dx}_${cellY + dy}`;
          gridCells.push(SHARPHelper.blindGridCell(sessionKey, cellStr, "Bob"));
        }
      }
      const gridCellsJson = JSON.stringify(gridCells);

      const payload = {
        category: apiCategory,
        urgency,
        context: context.trim() ? context.trim() : undefined,
        latitude: lat,
        longitude: lng,
        blindedGridSigs: syndromes,
        helperValidationKey: sessionKey,
        gridCellsJson,
      };

      if (!connectivityService.isOnline) {
        // Enqueue offline draft with 2 minutes (120,000ms) maxAge
        offlineQueueService.enqueue('CREATE_EPISODE', payload, 120000);
        
        // Optimistically proceed to Searching state
        startRequest(selectedCategory, urgency, context, lat, lng);
        const setSHARPParams = useEpisodeStore.getState().setSHARPParams;
        setSHARPParams(syndromes, sessionKey, sessionKey);
        navigation.replace('Searching');
        return;
      }

      const res = await episodeApi.createEpisode(payload);

      if (res.success && res.data && res.data.id) {
        const setSHARPParams = useEpisodeStore.getState().setSHARPParams;
        const setEpisodeId = useEpisodeStore.getState().setEpisodeId;
        startRequest(selectedCategory, urgency, context, lat, lng);
        setEpisodeId(res.data.id);
        setSHARPParams(syndromes, sessionKey, sessionKey);
        
        useRewardStore.getState().unlockBadge('REQUEST_DISPATCHED');
        NotificationService.notifyRequestCreated(selectedCategory || 'Emergency').catch(() => null);
        navigation.replace('Searching');
      } else {
        const errorMsg = (res as any).error?.message || 'Server failed to process the emergency broadcast.';
        Alert.alert('Broadcast Failed', errorMsg);
      }
    } catch (err: any) {
      console.warn('Broadcast API request error:', err.message);
      const errorMsg = err.response?.data?.error?.message || err.message || 'Unable to connect to the emergency server.';
      Alert.alert(
        'Broadcast Error',
        `Failed to transmit distress signal to the server:\n\n${errorMsg}\n\nVerify your profile setup, emergency guardians, and network connectivity.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.outline }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>CREATE HELP REQUEST</Text>
        <Icon name="radar" size={22} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: colors.onBackground }]}>Broadcast Emergency Signal</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Select your category and urgency. Signal will be transmitted to nearest verified volunteer responders.
          </Text>
        </View>

        {/* Ephemeral Privacy & Data Discard Notice */}
        <View style={[styles.privacyCard, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
          <Icon name="verified-user" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.privacyTitle, { color: colors.onBackground }]}>Zero-Trace Privacy Policy</Text>
            <Text style={[styles.privacyText, { color: colors.onSurfaceVariant }]}>
              Once your request is resolved or session expires, all GPS telemetry and incident data are automatically discarded.
            </Text>
          </View>
        </View>

        {/* GPS Live telemetry chip */}
        <View style={[styles.gpsChip, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <Icon name="my-location" size={16} color={latitude && longitude ? '#059669' : colors.primary} />
          <Text style={[styles.gpsText, { color: colors.onBackground }]}>
            {latitude !== null && longitude !== null && !(latitude === 0 && longitude === 0)
              ? `Satellite GPS Active: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              : 'Acquiring satellite GPS fix...'}
          </Text>
        </View>

        {/* Frequent Safe Places Quick Selector */}
        <View style={{ marginVertical: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={[styles.sectionLabel, { color: colors.onBackground, marginBottom: 0 }]}>SAVED DESTINATION / SAFE HAVEN</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FrequentLocations')}>
              <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 11, color: colors.primary }}>+ MANAGE</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {useFrequentLocationsStore.getState().locations.map((loc) => (
              <TouchableOpacity
                key={loc.id}
                onPress={() => setContext(`Dispatching emergency help for ${loc.name} (${loc.address}). GPS: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceContainerLowest,
                  borderWidth: 1,
                  borderColor: colors.outline,
                }}
              >
                <Icon name={loc.iconName || 'place'} size={16} color={colors.primary} />
                <Text style={{ fontFamily: theme.fontFamilies.secondary.medium, fontSize: 12, color: colors.onBackground }}>
                  {loc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category Bento Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.onBackground }]}>CATEGORY (12 DISPATCH TYPES)</Text>
          <View style={styles.grid}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryCard,
                    { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline },
                    isSelected ? { backgroundColor: colors.primary, borderColor: colors.primary } : null,
                  ]}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <Icon
                    name={cat.icon}
                    size={28}
                    color={isSelected ? '#FFFFFF' : colors.onBackground}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: isSelected ? '#FFFFFF' : colors.onBackground },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Urgency Level Selector */}
        <View style={styles.section}>
          <View style={styles.urgencyHeader}>
            <Text style={[styles.sectionLabel, { color: colors.onBackground }]}>URGENCY LEVEL</Text>
            <Text style={[styles.urgencyValue, { color: colors.onBackground }]}>{urgencyLabels[urgency - 1]}</Text>
          </View>

          <View style={styles.urgencyRow}>
            {[1, 2, 3, 4, 5].map((val) => {
              const isSelected = val === urgency;
              const isCriticalSelected = isSelected && val === 5;
              return (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.urgencyPill,
                    { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline },
                    isSelected ? { backgroundColor: isCriticalSelected ? '#EF4444' : colors.primary, borderColor: isCriticalSelected ? '#EF4444' : colors.primary } : null,
                  ]}
                  onPress={() => setUrgency(val)}
                >
                  <Text
                    style={[
                      styles.urgencyPillText,
                      { color: isSelected ? '#FFFFFF' : colors.onBackground },
                    ]}
                  >
                    {val}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Context Brief Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.onBackground }]}>SITUATION DETAILS (OPTIONAL)</Text>
          <View style={[styles.textAreaWrapper, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <TextInput
              style={[styles.textArea, { color: colors.onBackground }]}
              placeholder="Provide key details for responders..."
              placeholderTextColor={colors.onSurfaceVariant}
              multiline
              numberOfLines={4}
              value={context}
              onChangeText={setContext}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.outline }]}>
        <StandardButton
          title={loading ? 'BROADCASTING...' : 'BROADCAST REQUEST'}
          onPress={handleBroadcast}
          disabled={!selectedCategory || loading}
          loading={loading}
          icon={!loading && <Icon name="sensors" size={20} color="#FFFFFF" />}
          style={styles.broadcastButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 56,
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.outline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.containerPadding,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    color: theme.colors.onBackground,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.containerPadding,
    paddingVertical: theme.spacing.stackGap,
    paddingBottom: 110,
    gap: 20,
  },
  titleSection: {
    gap: 6,
  },
  mainTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 22,
    color: theme.colors.onBackground,
  },
  subtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.onSurfaceVariant,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: theme.colors.onBackground,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    height: 90,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  categoryCardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.outline,
  },
  categoryLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: theme.colors.onBackground,
  },
  categoryLabelSelected: {
    color: '#FFFFFF',
  },
  urgencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgencyValue: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 15,
    color: theme.colors.primary,
  },
  urgencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  urgencyPill: {
    flex: 1,
    height: 44,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyPillSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.outline,
  },
  urgencyPillText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 15,
    color: theme.colors.onBackground,
  },
  urgencyPillTextSelected: {
    color: '#FFFFFF',
  },
  textAreaWrapper: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
    padding: 12,
  },
  textArea: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
    color: theme.colors.onBackground,
    minHeight: 88,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.containerPadding,
    borderTopWidth: theme.spacing.borderWidthHeavy,
    borderTopColor: theme.colors.outline,
    alignItems: 'center',
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  privacyTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 13,
  },
  privacyText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  gpsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  gpsText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  broadcastButton: {
    width: '100%',
    maxWidth: 440,
  },
});

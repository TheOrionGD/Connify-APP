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
import { theme } from '../../theme';
import { StandardButton } from '../../components/buttons/StandardButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useEpisodeStore } from '../../stores/episodeStore';
import { episodeApi } from '../../services/api/episodeApi';
import { BloomFilter, SHARPHelper } from '../../utils/sharp';
import { useLocationStore } from '../../stores/locationStore';

type CategoryType = 'Medical' | 'Security' | 'Transport' | 'Other';

export default function CreateRequestScreen({ navigation }: any) {
  const startRequest = useEpisodeStore((state) => state.startRequest);
  const { latitude, longitude } = useLocationStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [urgency, setUrgency] = useState<number>(3);
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);

  const categories: { name: CategoryType; icon: string }[] = [
    { name: 'Medical', icon: 'medical-services' },
    { name: 'Security', icon: 'security' },
    { name: 'Transport', icon: 'local-taxi' },
    { name: 'Other', icon: 'warning' },
  ];

  const urgencyLabels = ['Low', 'Minor', 'Standard', 'High', 'Critical'];

  const handleBroadcast = async () => {
    if (!selectedCategory) {
      Alert.alert('Category Required', 'Please select an emergency category before broadcasting.');
      return;
    }
    setLoading(true);
    try {
      const categoryMapping: Record<CategoryType, 'medical' | 'transport' | 'general' | 'emergency'> = {
        'Medical': 'medical',
        'Transport': 'transport',
        'Security': 'emergency',
        'Other': 'general',
      };
      const apiCategory = categoryMapping[selectedCategory];

      const lat = latitude || 0;
      const lng = longitude || 0;

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

      const res = await episodeApi.createEpisode({
        category: apiCategory,
        urgency,
        context: context.trim() ? context.trim() : undefined,
        latitude: lat,
        longitude: lng,
        bchSyndromes: syndromes,
        helperStringY: sessionKey,
        gridCellsJson,
      });

      if (res.success && res.data && res.data.id) {
        const setSHARPParams = useEpisodeStore.getState().setSHARPParams;
        const setEpisodeId = useEpisodeStore.getState().setEpisodeId;
        
        startRequest(selectedCategory, urgency, context, lat, lng);
        setEpisodeId(res.data.id);
        setSHARPParams(syndromes, sessionKey, sessionKey);
        
        navigation.replace('Searching');
      } else {
        startRequest(selectedCategory, urgency, context, lat, lng);
        navigation.replace('Searching');
      }
    } catch (err: any) {
      console.warn('Broadcast fallback to local session state:', err.message);
      startRequest(selectedCategory, urgency, context, latitude || 0, longitude || 0);
      navigation.replace('Searching');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CREATE HELP REQUEST</Text>
        <Icon name="radar" size={22} color={theme.colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Broadcast Emergency Signal</Text>
          <Text style={styles.subtitle}>
            Select your category and urgency. Signal will be transmitted to nearest verified volunteer responders.
          </Text>
        </View>

        {/* Category Bento Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CATEGORY</Text>
          <View style={styles.grid}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryCard,
                    isSelected ? styles.categoryCardSelected : null,
                  ]}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <Icon
                    name={cat.icon}
                    size={30}
                    color={isSelected ? '#FFFFFF' : theme.colors.onBackground}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      isSelected ? styles.categoryLabelSelected : null,
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
            <Text style={styles.sectionLabel}>URGENCY LEVEL</Text>
            <Text style={styles.urgencyValue}>{urgencyLabels[urgency - 1]}</Text>
          </View>

          <View style={styles.urgencyRow}>
            {[1, 2, 3, 4, 5].map((val) => {
              const isSelected = val === urgency;
              return (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.urgencyPill,
                    isSelected ? styles.urgencyPillSelected : null,
                  ]}
                  onPress={() => setUrgency(val)}
                >
                  <Text
                    style={[
                      styles.urgencyPillText,
                      isSelected ? styles.urgencyPillTextSelected : null,
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
          <Text style={styles.sectionLabel}>SITUATION DETAILS (OPTIONAL)</Text>
          <View style={styles.textAreaWrapper}>
            <TextInput
              style={styles.textArea}
              placeholder="Provide key details for responders..."
              placeholderTextColor="#777777"
              multiline
              numberOfLines={4}
              value={context}
              onChangeText={setContext}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
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
  broadcastButton: {
    width: '100%',
    maxWidth: 440,
  },
});

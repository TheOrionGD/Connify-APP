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
    { name: 'Other', icon: 'more-horiz' },
  ];

  const urgencyLabels = ['Low', 'Minor', 'Standard', 'High', 'Critical'];

  const handleBroadcast = async () => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const categoryMapping: Record<CategoryType, 'medical' | 'transport' | 'general' | 'emergency'> = {
        'Medical': 'medical',
        'Transport': 'transport',
        'Security': 'emergency',
        'Other': 'general',
      };
      const apiCategory = categoryMapping[selectedCategory];

      if (latitude === null || longitude === null) {
        Alert.alert('Location Required', 'Cannot broadcast request without device location. Please enable location permissions.');
        setLoading(false);
        return;
      }

      const lat = latitude;
      const lng = longitude;

      const signals = ["AP_KRCT_01", "AP_KRCT_02", "AP_KRCT_03", "Cell_LTE_404_45_01"];
      const bloom = new BloomFilter(1024, 4);
      signals.forEach(sig => bloom.add(sig));

      const sessionKey = Math.random().toString(36).substring(2, 10);
      const syndromes = SHARPHelper.generateSyndromes(bloom.getBits());

      const cellX = Math.floor(lat * 100);
      const cellY = Math.floor(lng * 100);
      const cellStr = `grid_${cellX}_${cellY}`;
      const blindedCell = SHARPHelper.blindGridCell(sessionKey, cellStr, "Bob");
      const gridCellsJson = JSON.stringify([blindedCell]);

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

      if (res.success && res.data.id) {
        const setSHARPParams = useEpisodeStore.getState().setSHARPParams;
        const setEpisodeId = useEpisodeStore.getState().setEpisodeId;
        
        startRequest(selectedCategory, urgency, context, lat, lng);
        setEpisodeId(res.data.id);
        setSHARPParams(syndromes, sessionKey, sessionKey);
        
        navigation.replace('Searching');
      } else {
        Alert.alert('Error', 'Failed to broadcast request');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Failed to broadcast request: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* AppBar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connify Safety</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header context info */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Create Help Request</Text>
          <Text style={styles.subtitle}>
            Detail your situation. Your trust circle and nearby responders will be notified.
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
                    size={32}
                    color={isSelected ? '#ffffff' : theme.colors.onBackground}
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

        {/* Urgency Slider Selector */}
        <View style={styles.section}>
          <View style={styles.urgencyHeader}>
            <Text style={styles.sectionLabel}>URGENCY LEVEL</Text>
            <Text style={styles.urgencyValue}>{urgencyLabels[urgency - 1]}</Text>
          </View>

          <View style={styles.sliderContainer}>
            <View style={styles.sliderTicks}>
              {[1, 2, 3, 4, 5].map((val) => {
                const isActive = val <= urgency;
                return (
                  <TouchableOpacity
                    key={val}
                    style={styles.tickWrapper}
                    onPress={() => setUrgency(val)}
                  >
                    <View
                      style={[
                        styles.tickDot,
                        isActive ? styles.tickDotActive : null,
                        val === urgency ? styles.tickDotSelected : null,
                      ]}
                    />
                    <Text style={styles.tickLabel}>{val}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.sliderBarBg}>
              <View
                style={[
                  styles.sliderBarFill,
                  { width: `${((urgency - 1) / 4) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Context Brief */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONTEXT (OPTIONAL)</Text>
          <View style={styles.textAreaWrapper}>
            <TextInput
              style={styles.textArea}
              placeholder="Describe your need briefly..."
              placeholderTextColor="#a0a0a0"
              multiline
              numberOfLines={4}
              value={context}
              onChangeText={setContext}
              textAlignVertical="top"
            />
            <View style={styles.textAreaIcon}>
              <Icon name="edit-note" size={24} color={theme.colors.secondary} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Broadcast CTA */}
      <View style={styles.bottomBar}>
        <StandardButton
          title={loading ? 'BROADCASTING...' : 'BROADCAST REQUEST'}
          onPress={handleBroadcast}
          disabled={!selectedCategory || loading}
          loading={loading}
          icon={!loading && <Icon name="radio" size={20} color={theme.colors.onPrimary} />}
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
    height: 64,
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.outlineVariant,
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
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  headerRight: {
    width: 32, // placeholder for layout symmetry
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.containerPadding,
    paddingVertical: theme.spacing.stackGap,
    paddingBottom: 110, // space for bottom sticky bar
    gap: 24,
  },
  titleSection: {
    gap: 8,
  },
  mainTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 26,
    lineHeight: 34,
    color: theme.colors.onBackground,
  },
  subtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.onSurfaceVariant,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: theme.colors.onBackground,
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCard: {
    width: '47%',
    aspectRatio: 1.2,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.onBackground,
    borderRadius: theme.spacing.radiusDefault,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  categoryCardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    color: theme.colors.onBackground,
  },
  categoryLabelSelected: {
    color: '#ffffff',
  },
  urgencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgencyValue: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 16,
    color: theme.colors.primary,
  },
  sliderContainer: {
    height: 60,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
    width: '100%',
  },
  tickWrapper: {
    alignItems: 'center',
    width: 44,
  },
  tickDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  tickDotActive: {
    backgroundColor: theme.colors.primary,
  },
  tickDotSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: theme.colors.primary,
    transform: [{ translateY: -4 }],
  },
  tickLabel: {
    fontFamily: theme.fontFamilies.technical.medium,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  sliderBarBg: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 6,
    backgroundColor: theme.colors.secondaryContainer,
    borderRadius: 3,
    top: 24,
    zIndex: 1,
  },
  sliderBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  textAreaWrapper: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.onBackground,
    padding: theme.spacing.base,
    position: 'relative',
  },
  textArea: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 15,
    color: theme.colors.onBackground,
    minHeight: 100,
    paddingRight: 32,
  },
  textAreaIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    opacity: 0.4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.containerPadding,
    borderTopWidth: theme.spacing.borderWidthLight,
    borderTopColor: theme.colors.outlineVariant,
    alignItems: 'center',
  },
  broadcastButton: {
    width: '100%',
    maxWidth: 440,
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { StandardCard } from '../../components/cards/StandardCard';
import { DialogueModal } from '../../components/common/DialogueModal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { episodeApi } from '../../services/api/episodeApi';
import { capsuleApi } from '../../services/api/capsuleApi';
import { useAuthStore } from '../../stores/authStore';
import { useEpisodeStore } from '../../stores/episodeStore';
import { BloomFilter, SHARPHelper } from '../../utils/sharp';
import { useLocationStore } from '../../stores/locationStore';

interface HelpRequest {
  id: string;
  category: string;
  icon: string;
  distance: string;
  urgency: number;
  timeAgo: string;
  details: string;
}

export default function NearbyRequestsScreen({ navigation }: any) {
  const { latitude, longitude } = useLocationStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [handshakeLoading, setHandshakeLoading] = useState(false);

  const fetchFeed = async () => {
    if (latitude === null || longitude === null) {
      setRequests([]);
      return;
    }
    
    setLoadingFeed(true);
    try {
      const res = await episodeApi.getNearbyEpisodes(latitude, longitude, 5000);
      if (res.success && res.data && res.data.length > 0) {
        const apiRequests: HelpRequest[] = res.data.map((ep: any) => ({
          id: ep.id,
          category: ep.category ? (ep.category.charAt(0).toUpperCase() + ep.category.slice(1) + ' Request') : 'Emergency Request',
          icon: ep.category === 'medical' ? 'medical-services' : ep.category === 'transport' ? 'local-taxi' : ep.category === 'emergency' ? 'security' : 'warning',
          distance: `~${Math.round(ep.distanceMeters || 150)}m`,
          urgency: ep.urgency || 3,
          timeAgo: 'Live',
          details: `Zero-trust proximity verification required. Tap Offer Support to initialize cryptographic handshake.`,
        }));
        setRequests(apiRequests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.warn('⚠️ Failed to fetch nearby requests:', err);
      setRequests([]);
    } finally {
      setLoadingFeed(false);
    }
  };

  React.useEffect(() => {
    fetchFeed();
  }, [latitude, longitude]);

  const handleRespond = (req: HelpRequest) => {
    setSelectedRequest(req);
    setModalVisible(true);
  };

  const handleConfirmResponse = async () => {
    if (!selectedRequest) return;
    setModalVisible(false);
    setHandshakeLoading(true);
    try {
      const epDetail = await episodeApi.getEpisode(selectedRequest.id);
      const bchSyndromes = epDetail.data?.bchSyndromes;
      const helperStringY = epDetail.data?.helperStringY;

      if (!bchSyndromes || !helperStringY) {
        // Fallback to handshake screen for direct zero-trust verification
        navigation.navigate('Handshake', { episodeId: selectedRequest.id });
        return;
      }

      // Generate dynamic signals from helper coordinates rounded to 3 decimal places
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

      const signalsBob = getGridSignals(latitude || 0, longitude || 0);
      const bloomBob = new BloomFilter(1024, 4);
      signalsBob.forEach(sig => bloomBob.add(sig));

      const K = helperStringY;
      const cellX = Math.floor((latitude || 0) * 100);
      const cellY = Math.floor((longitude || 0) * 100);
      const cellStr = `grid_${cellX}_${cellY}`;
      const blindedGridCell = SHARPHelper.blindGridCell(K, cellStr, "Bob");

      const deviceId = useAuthStore.getState().deviceId;
      if (!deviceId) throw new Error('Missing registered device identity');

      // Dynamically derive token hash based on episode details and helper ID
      const qrTokenHash = SHARPHelper.blindGridCell(selectedRequest.id, deviceId, "QR");

      const capsuleRes = await capsuleApi.issueCapsule({
        episodeId: selectedRequest.id,
        helperDeviceId: deviceId,
        verificationData: {
          qrTokenHash,
          blindedGridCell,
        },
      });

      if (capsuleRes.success) {
        Alert.alert('Proximity Verification Success', 'Zero-trust JIT Trust Capsule issued!');
        const setEpisodeId = useEpisodeStore.getState().setEpisodeId;
        const activateEpisode = useEpisodeStore.getState().activateEpisode;
        setEpisodeId(selectedRequest.id);
        activateEpisode(`chan-${selectedRequest.id}`, 10);
        navigation.navigate('Handshake', { episodeId: selectedRequest.id });
      } else {
        navigation.navigate('Handshake', { episodeId: selectedRequest.id });
      }
    } catch (err: any) {
      console.log('Handshake fallback to Manual Verification:', err.message);
      navigation.navigate('Handshake', { episodeId: selectedRequest.id });
    } finally {
      setHandshakeLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Icon name="explore" size={24} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>NEARBY RESPONDER FEED</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchFeed}>
          <Icon name="refresh" size={22} color={theme.colors.onBackground} />
        </TouchableOpacity>
      </View>

      {handshakeLoading && (
        <View style={styles.loadingBanner}>
          <ActivityIndicator color={theme.colors.primary} size="small" />
          <Text style={styles.loadingBannerText}>
            INITIALIZING ZERO-TRUST HANDSHAKE...
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Emergency Broadcasts Nearby</Text>
          <Text style={styles.feedSubtitle}>
            Review active emergency requests in your area. Offer support to initiate proximity verification.
          </Text>
        </View>

        <View style={styles.listContainer}>
          {loadingFeed ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 24 }} />
          ) : requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="location-off" size={48} color={theme.colors.onBackground} />
              <Text style={styles.emptyStateTitle}>No Active Nearby Signals</Text>
              <Text style={styles.emptyStateText}>
                There are currently no active emergency requests reported in your immediate vicinity.
              </Text>
              <TouchableOpacity style={styles.scanButton} onPress={fetchFeed}>
                <Text style={styles.scanButtonText}>REFRESH FEED</Text>
                <Icon name="refresh" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            requests.map((req) => {
              const isHighUrgency = req.urgency >= 4;
              return (
                <StandardCard
                  key={req.id}
                  style={[
                    styles.card,
                    isHighUrgency ? styles.highUrgencyCard : null,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardCategoryWrapper}>
                      <Icon
                        name={req.icon}
                        size={20}
                        color={isHighUrgency ? theme.colors.primary : theme.colors.onBackground}
                      />
                      <Text style={styles.categoryText}>{req.category}</Text>
                    </View>
                    <View
                      style={[
                        styles.urgencyBadge,
                        isHighUrgency ? styles.urgencyHigh : styles.urgencyNormal,
                      ]}
                    >
                      <Text style={[styles.urgencyText, isHighUrgency ? { color: '#FFFFFF' } : null]}>
                        LEVEL {req.urgency}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.detailsText}>{req.details}</Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.footerMetric}>
                      <Icon name="my-location" size={14} color={theme.colors.onSurfaceVariant} />
                      <Text style={styles.metricText}>{req.distance}</Text>
                    </View>
                    <View style={styles.footerMetric}>
                      <Icon name="schedule" size={14} color={theme.colors.onSurfaceVariant} />
                      <Text style={styles.metricText}>{req.timeAgo}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.cardActionButton}
                    onPress={() => handleRespond(req)}
                    disabled={handshakeLoading}
                  >
                    <Text style={styles.actionButtonText}>OFFER SUPPORT</Text>
                    <Icon name="directions-walk" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </StandardCard>
              );
            })
          )}
        </View>
      </ScrollView>

      <DialogueModal
        visible={modalVisible}
        title="Confirm Response Protocol"
        message={`Are you sure you want to offer support for this ${selectedRequest?.category}? This will initialize the cryptographic zero-trust handshake.`}
        onClose={() => setModalVisible(false)}
        confirmText="Respond Now"
        onConfirm={handleConfirmResponse}
        cancelText="Cancel"
      />
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    color: theme.colors.onBackground,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  refreshButton: {
    padding: 4,
  },
  loadingBanner: {
    padding: 10,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderColor: theme.colors.outline,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingBannerText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontFamily: theme.fontFamilies.technical.bold,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.containerPadding,
    paddingVertical: theme.spacing.stackGap,
    gap: 16,
  },
  feedHeader: {
    gap: 6,
  },
  feedTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 22,
    color: theme.colors.onBackground,
  },
  feedSubtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.onSurfaceVariant,
  },
  listContainer: {
    gap: 14,
  },
  card: {
    gap: 12,
    padding: 16,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
  },
  highUrgencyCard: {
    borderColor: theme.colors.primary,
    borderWidth: theme.spacing.borderWidthHeavy,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategoryWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 15,
    color: theme.colors.onBackground,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  urgencyHigh: {
    backgroundColor: theme.colors.primary,
  },
  urgencyNormal: {
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  urgencyText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: theme.colors.onBackground,
  },
  detailsText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.onSurfaceVariant,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceContainerHigh,
    paddingTop: 8,
  },
  footerMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontFamily: theme.fontFamilies.technical.medium,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  cardActionButton: {
    backgroundColor: theme.colors.primary,
    height: 44,
    borderRadius: theme.spacing.radiusDefault,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusMd,
    padding: 20,
  },
  emptyStateTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 18,
    color: theme.colors.onBackground,
  },
  emptyStateText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 19,
  },
  scanButton: {
    backgroundColor: theme.colors.onBackground,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.spacing.radiusFull,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
});

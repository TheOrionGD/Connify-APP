import React, { useState, useEffect } from 'react';
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
import { useTheme, actionColors } from '../../theme';
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
  const { latitude, longitude, loading: locationLoading, startWatchingLocation } = useLocationStore();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [handshakeLoading, setHandshakeLoading] = useState(false);

  const hasValidLocation = latitude !== null && longitude !== null && !(latitude === 0 && longitude === 0);

  const fetchFeed = async () => {
    if (!hasValidLocation) {
      // Guard call: skip/hold if coordinates are invalid or not yet resolved
      return;
    }
    setLoadingFeed(true);
    try {
      const res = await episodeApi.getNearbyEpisodes(latitude, longitude, 10000);
      if (res.success && res.data && res.data.length > 0) {
        const apiRequests: HelpRequest[] = res.data.map((ep: any) => ({
          id: ep.id,
          category: ep.category ? (ep.category.charAt(0).toUpperCase() + ep.category.slice(1) + ' Request') : 'Emergency Request',
          icon: ep.category === 'medical' ? 'medical-services' : ep.category === 'transport' ? 'local-taxi' : ep.category === 'emergency' ? 'security' : 'warning',
          distance: ep.distanceMeters !== undefined ? (ep.distanceMeters < 50 ? '📍 < 50m (Immediate)' : `~${Math.round(ep.distanceMeters)}m`) : 'Nearby',
          urgency: ep.urgency || 3,
          timeAgo: 'Live Broadcast',
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

  useEffect(() => {
    startWatchingLocation();
  }, [startWatchingLocation]);

  useEffect(() => {
    if (hasValidLocation) {
      fetchFeed();
    }
  }, [latitude, longitude, hasValidLocation]);

  const handleRespond = (req: HelpRequest) => {
    setSelectedRequest(req);
    setModalVisible(true);
  };

  const handleConfirmResponse = async () => {
    if (!selectedRequest || !hasValidLocation) return;
    setModalVisible(false);
    setHandshakeLoading(true);
    try {
      const epDetail = await episodeApi.getEpisode(selectedRequest.id);
      const bchSyndromes = epDetail.data?.bchSyndromes;
      const helperStringY = epDetail.data?.helperStringY;

      if (!bchSyndromes || !helperStringY) {
        navigation.navigate('Handshake', { episodeId: selectedRequest.id });
        return;
      }

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

      const signalsBob = getGridSignals(latitude!, longitude!);
      const bloomBob = new BloomFilter(1024, 4);
      signalsBob.forEach(sig => bloomBob.add(sig));

      const K = helperStringY;
      const cellX = Math.floor(latitude! * 100);
      const cellY = Math.floor(longitude! * 100);
      const cellStr = `grid_${cellX}_${cellY}`;
      const blindedGridCell = SHARPHelper.blindGridCell(K, cellStr, "Bob");

      const deviceId = useAuthStore.getState().deviceId;
      if (!deviceId) throw new Error('Missing registered device identity');

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.outline }]}>
        <View style={styles.headerTitleContainer}>
          <Icon name="explore" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>NEARBY RESPONDER FEED</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchFeed} disabled={!hasValidLocation}>
          <Icon name="refresh" size={22} color={colors.onBackground} />
        </TouchableOpacity>
      </View>

      {handshakeLoading && (
        <View style={[styles.loadingBanner, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outline }]}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadingBannerText}>
            INITIALIZING ZERO-TRUST HANDSHAKE...
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.feedHeader}>
          <Text style={[styles.feedTitle, { color: colors.onBackground }]}>Emergency Broadcasts Nearby</Text>
          <Text style={[styles.feedSubtitle, { color: colors.onSurfaceVariant }]}>
            Review active emergency requests in your area. Offer support to initiate proximity verification.
          </Text>
        </View>

        <View style={styles.listContainer}>
          {!hasValidLocation || locationLoading ? (
            <View style={[styles.locationLoadingState, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.locationLoadingTitle, { color: colors.onBackground }]}>Getting your location…</Text>
              <Text style={[styles.locationLoadingText, { color: colors.onSurfaceVariant }]}>
                Acquiring high-accuracy GPS fix before fetching nearby emergency broadcasts.
              </Text>
            </View>
          ) : loadingFeed ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
          ) : requests.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
              <Icon name="location-off" size={48} color={colors.onBackground} />
              <Text style={[styles.emptyStateTitle, { color: colors.onBackground }]}>No Active Nearby Signals</Text>
              <Text style={[styles.emptyStateText, { color: colors.onSurfaceVariant }]}>
                There are currently no active emergency requests reported in your immediate vicinity.
              </Text>
              <TouchableOpacity style={styles.scanButton} onPress={fetchFeed}>
                <Text style={styles.scanButtonText}>REFRESH FEED</Text>
                <Icon name="refresh" size={16} color="#000000" />
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
                    { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline },
                    isHighUrgency ? styles.highUrgencyCard : null,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardCategoryWrapper}>
                      <Icon
                        name={req.icon}
                        size={20}
                        color={isHighUrgency ? colors.primary : colors.onBackground}
                      />
                      <Text style={[styles.categoryText, { color: colors.onBackground }]}>{req.category}</Text>
                    </View>
                    <View
                      style={[
                        styles.urgencyBadge,
                        isHighUrgency ? styles.urgencyHigh : { backgroundColor: colors.surfaceContainerHigh },
                      ]}
                    >
                      <Text style={[styles.urgencyText, { color: '#000000' }]}>
                        LEVEL {req.urgency}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.detailsText, { color: colors.onSurfaceVariant }]}>{req.details}</Text>

                  <View style={[styles.cardFooter, { borderTopColor: colors.outline }]}>
                    <View style={[styles.footerMetric, { backgroundColor: colors.surfaceContainerHigh }]}>
                      <Icon name="my-location" size={14} color={colors.onSurfaceVariant} />
                      <Text style={[styles.metricText, { color: colors.onBackground }]}>{req.distance}</Text>
                    </View>
                    <View style={[styles.footerMetric, { backgroundColor: colors.surfaceContainerHigh }]}>
                      <Icon name="schedule" size={14} color={colors.onSurfaceVariant} />
                      <Text style={[styles.metricText, { color: colors.onBackground }]}>{req.timeAgo}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.cardActionButton}
                    onPress={() => handleRespond(req)}
                    disabled={handshakeLoading}
                  >
                    <Text style={styles.actionButtonText}>OFFER SUPPORT</Text>
                    <Icon name="directions-walk" size={16} color="#000000" />
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
  },
  header: {
    height: 56,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 14,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  refreshButton: {
    padding: 4,
  },
  loadingBanner: {
    padding: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingBannerText: {
    fontSize: 11,
    color: '#EF4444',
    fontFamily: 'SpaceGrotesk-Bold',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  feedHeader: {
    gap: 6,
  },
  feedTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 22,
  },
  feedSubtitle: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  listContainer: {
    gap: 14,
  },
  locationLoadingState: {
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
  },
  locationLoadingTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 16,
    marginTop: 4,
  },
  locationLoadingText: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  card: {
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
  },
  highUrgencyCard: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategoryWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryText: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 15,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: actionColors.actionRed,
  },
  urgencyHigh: {
    backgroundColor: actionColors.actionRed,
    borderColor: '#EF4444',
  },
  urgencyNormal: {
    backgroundColor: actionColors.actionRed,
  },
  urgencyText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    color: actionColors.actionButtonText,
    letterSpacing: 0.5,
  },
  detailsText: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  footerMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 11,
  },
  cardActionButton: {
    backgroundColor: actionColors.actionRed,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  actionButtonText: {
    color: actionColors.actionButtonText,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  emptyStateTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 18,
  },
  emptyStateText: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  scanButton: {
    backgroundColor: actionColors.actionRed,
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  scanButtonText: {
    color: actionColors.actionButtonText,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});

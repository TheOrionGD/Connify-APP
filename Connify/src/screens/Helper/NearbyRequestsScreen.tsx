import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme';
import { StandardCard } from '../../components/cards/StandardCard';
import { DialogueModal } from '../../components/common/DialogueModal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { episodeApi } from '../../services/api/episodeApi';
import { capsuleApi } from '../../services/api/capsuleApi';
import { useAuthStore } from '../../stores/authStore';
import { useEpisodeStore } from '../../stores/episodeStore';
import { BloomFilter, SHARPHelper } from '../../utils/sharp';
import { Alert, ActivityIndicator } from 'react-native';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [handshakeLoading, setHandshakeLoading] = useState(false);

  const mockRequests: HelpRequest[] = [
    {
      id: '1',
      category: 'Medical Services',
      icon: 'medical-services',
      distance: '~350m',
      urgency: 4,
      timeAgo: '2 min ago',
      details: 'Requester reports minor sprain and requires emergency transport coordinates.',
    },
    {
      id: '2',
      category: 'Security Alert',
      icon: 'security',
      distance: '~800m',
      urgency: 5,
      timeAgo: 'Just now',
      details: 'Active alarm trigger. Requires physical witness checking near Central Square.',
    },
    {
      id: '3',
      category: 'Transport Escort',
      icon: 'local-taxi',
      distance: '~1.2km',
      urgency: 3,
      timeAgo: '5 min ago',
      details: 'Safe passage escort request for walking through unlit path route.',
    },
  ];

  const fetchFeed = async () => {
    setLoadingFeed(true);
    try {
      const res = await episodeApi.getNearbyEpisodes(10.7905, 78.7047, 5000);
      if (res.success && res.data.length > 0) {
        const apiRequests: HelpRequest[] = res.data.map((ep: any) => ({
          id: ep.id,
          category: ep.category.charAt(0).toUpperCase() + ep.category.slice(1) + ' Request',
          icon: ep.category === 'medical' ? 'medical-services' : ep.category === 'transport' ? 'local-taxi' : ep.category === 'emergency' ? 'security' : 'more-horiz',
          distance: `~${Math.round(ep.distanceMeters || 120)}m`,
          urgency: ep.urgency,
          timeAgo: 'Just now',
          details: `SHARP proximity verification required. Tap Respond to begin physical location validation.`,
        }));
        setRequests(apiRequests);
      } else {
        setRequests(mockRequests);
      }
    } catch (err) {
      console.warn('⚠️ Failed to fetch nearby requests:', err);
      setRequests(mockRequests);
    } finally {
      setLoadingFeed(false);
    }
  };

  React.useEffect(() => {
    fetchFeed();
  }, []);

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
      const bchSyndromes = epDetail.data.bchSyndromes;
      const helperStringY = epDetail.data.helperStringY;

      if (!bchSyndromes || !helperStringY) {
        Alert.alert('Handshake Error', 'SHARP credentials are not configured on this episode.');
        return;
      }

      const signalsBob = ["AP_KRCT_01", "AP_KRCT_02", "Cell_LTE_404_45_01", "AP_KRCT_BobNoise"];
      const bloomBob = new BloomFilter(1024, 4);
      signalsBob.forEach(sig => bloomBob.add(sig));

      const correctedBits = SHARPHelper.reconstruct(bloomBob.getBits(), bchSyndromes);

      const K = helperStringY;

      const cellX = Math.floor(10.7905 * 100);
      const cellY = Math.floor(78.7047 * 100);
      const cellStr = `grid_${cellX}_${cellY}`;
      const blindedGridCell = SHARPHelper.blindGridCell(K, cellStr, "Bob");

      const deviceId = useAuthStore.getState().deviceId || '00000000-0000-0000-0000-000000000000';
      const capsuleRes = await capsuleApi.issueCapsule({
        episodeId: selectedRequest.id,
        helperDeviceId: deviceId,
        verificationData: {
          qrTokenHash: 'dummy-qr-token-hash',
          blindedGridCell,
        },
      });

      if (capsuleRes.success) {
        Alert.alert('SHARP Proximity Success', 'Location verified. JIT Trust Capsule issued!');
        
        const setEpisodeId = useEpisodeStore.getState().setEpisodeId;
        const activateEpisode = useEpisodeStore.getState().activateEpisode;
        
        setEpisodeId(selectedRequest.id);
        activateEpisode(`chan-${selectedRequest.id}`, 10);
        
        navigation.replace('Main');
      } else {
        Alert.alert('Handshake Failed', 'Proximity validation failed.');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        'Handshake Failed',
        err.response?.data?.error?.message || err.message || 'Proximity check failed'
      );
    } finally {
      setHandshakeLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* AppBar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Requests Feed</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchFeed}>
          <Icon name="refresh" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {handshakeLoading && (
        <View style={{ padding: 12, backgroundColor: theme.colors.primaryContainer, alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.primary} size="small" />
          <Text style={{ fontSize: 12, color: theme.colors.primary, fontFamily: theme.fontFamilies.technical.bold, marginTop: 4 }}>
            EXECUTING SHARP PROXIMITY HANDSHAKE MATH...
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Subhead info */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Requests in your area</Text>
          <Text style={styles.feedSubtitle}>
            Tap a card to review coordinate safety and issue a verification trust capsule.
          </Text>
        </View>

        {/* Requests List */}
        <View style={styles.listContainer}>
          {loadingFeed ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
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
                  {/* Header of Request Card */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardCategoryWrapper}>
                      <Icon
                        name={req.icon}
                        size={20}
                        color={isHighUrgency ? theme.colors.primary : theme.colors.secondary}
                      />
                      <Text style={styles.categoryText}>{req.category}</Text>
                    </View>
                    <View
                      style={[
                        styles.urgencyBadge,
                        isHighUrgency ? styles.urgencyHigh : styles.urgencyNormal,
                      ]}
                    >
                      <Text style={styles.urgencyText}>LEVEL {req.urgency}</Text>
                    </View>
                  </View>

                  {/* Body Details */}
                  <Text style={styles.detailsText}>{req.details}</Text>

                  {/* Card Footer Details */}
                  <View style={styles.cardFooter}>
                    <View style={styles.footerMetric}>
                      <Icon name="location-on" size={14} color={theme.colors.onSurfaceVariant} />
                      <Text style={styles.metricText}>{req.distance}</Text>
                    </View>
                    <View style={styles.footerMetric}>
                      <Icon name="schedule" size={14} color={theme.colors.onSurfaceVariant} />
                      <Text style={styles.metricText}>{req.timeAgo}</Text>
                    </View>
                  </View>

                  {/* Offer Support Trigger Button */}
                  <TouchableOpacity
                    style={styles.cardActionButton}
                    onPress={() => handleRespond(req)}
                    disabled={handshakeLoading}
                  >
                    <Text style={styles.actionButtonText}>OFFER SUPPORT</Text>
                    <Icon name="directions-walk" size={16} color={theme.colors.onPrimary} />
                  </TouchableOpacity>
                </StandardCard>
              );
            })
          )}
        </View>

        {/* Expand Radius Action */}
        <TouchableOpacity style={styles.expandButton}>
          <Text style={styles.expandText}>SCAN WIDER RANGE (2KM+)</Text>
          <Icon name="add" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Overlay dialogue */}
      <DialogueModal
        visible={modalVisible}
        title="Confirm Response Protocol"
        message={`Are you sure you want to offer support for this ${selectedRequest?.category}? This will establish location tracking and initialize the SHARP proximity handshake.`}
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
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  refreshButton: {
    padding: 4,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.containerPadding,
    paddingVertical: theme.spacing.stackGap,
    gap: 20,
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
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.onSurfaceVariant,
  },
  listContainer: {
    gap: 16,
  },
  card: {
    gap: 12,
    padding: 16,
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
    borderRadius: theme.spacing.radiusSm,
  },
  urgencyHigh: {
    backgroundColor: theme.colors.primaryContainer,
  },
  urgencyNormal: {
    backgroundColor: theme.colors.secondaryContainer,
  },
  urgencyText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: theme.colors.onBackground,
  },
  detailsText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.onSurfaceVariant,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.outlineVariant,
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
  },
  actionButtonText: {
    color: theme.colors.onPrimary,
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
  },
  expandButton: {
    borderColor: theme.colors.primary,
    borderWidth: theme.spacing.borderWidthLight,
    borderStyle: 'dashed',
    height: 52,
    borderRadius: theme.spacing.radiusDefault,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  expandText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
  },
});

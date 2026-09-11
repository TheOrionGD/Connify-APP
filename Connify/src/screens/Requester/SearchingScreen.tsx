import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, useTheme } from '../../theme';
import { episodeApi } from '../../services/api/episodeApi';
import { useEpisodeStore } from '../../stores/episodeStore';
import { socketService } from '../../services/socketService';
import { StandardButton } from '../../components/buttons/StandardButton';
import { CircularRadarMap } from '../../components/common/CircularRadarMap';
import { useLocationStore } from '../../stores/locationStore';
import { NotificationService } from '../../services/NotificationService';
import { EmergencyChatModal } from '../../components/chat/EmergencyChatModal';
import { EmergencyCallModal } from '../../components/call/EmergencyCallModal';
import { useCallStore } from '../../stores/callStore';
import { calculateDistanceMeters } from '../../utils/telemetry';

export default function SearchingScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { currentState, cancelRequest, category, urgency, episodeId, activateEpisode, description, timeLeft, tickCountdown } = useEpisodeStore();
  const { latitude, longitude } = useLocationStore();
  const [responderState, setResponderState] = React.useState<{
    helperDeviceId: string;
    distanceStr: string;
    isEnRoute: boolean;
    latitude?: number;
    longitude?: number;
  } | null>(null);
  const [showChatModal, setShowChatModal] = React.useState(false);
  const [showCallModal, setShowCallModal] = React.useState(false);
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const { startOutgoingCall, receiveIncomingCall } = useCallStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
      tickCountdown();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickCountdown]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const pulse1 = useSharedValue(0);
  const pulse2 = useSharedValue(0);

  useEffect(() => {
    pulse1.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    pulse2.value = withDelay(
      800,
      withRepeat(
        withTiming(1, { duration: 2500, easing: Easing.out(Easing.ease) }),
        -1,
        false
      )
    );
  }, [pulse1, pulse2]);

  useEffect(() => {
    if (currentState === 'idle') {
      navigation.replace('Main');
    } else if (currentState === 'active') {
      navigation.replace('EmergencyRequest');
    }
  }, [currentState, navigation]);

  useEffect(() => {
    if (!episodeId) return;

    if (!socketService.isConnected()) {
      socketService.connect();
    }

    socketService.joinEpisode(episodeId, (err) => {
      if (err) console.warn('[SearchingScreen] Failed to join socket room:', err);
    });

    const unsub = socketService.onCapsuleIssued(() => {
      console.log('[SearchingScreen] Capsule issued socket event received!');
      activateEpisode(`chan-${episodeId}`, 15, 'requester');
      navigation.replace('EmergencyRequest');
    });

    const unsubCancelled = socketService.onEpisodeCancelled(({ episodeId: cancelledId }) => {
      if (cancelledId === episodeId) {
        cancelRequest();
      }
    });

    const getDistanceLabel = (respLat?: number, respLng?: number) => {
      if (latitude && longitude && respLat && respLng) {
        const dM = calculateDistanceMeters(latitude, longitude, respLat, respLng);
        return dM < 50 ? '📍 On Scene (<50m)' : `En route (~${dM}m)`;
      }
      return 'En route to location';
    };

    const unsubHelperAccepted = socketService.onHelperAccepted((data) => {
      const respLat = data.latitude;
      const respLng = data.longitude;
      const respInfo = {
        helperDeviceId: data.helperDeviceId,
        distanceStr: getDistanceLabel(respLat, respLng),
        isEnRoute: true,
        latitude: respLat,
        longitude: respLng,
      };
      useEpisodeStore.getState().setResponderInfo(respInfo);
      setResponderState(respInfo);
      NotificationService.notifyHelperAccepted(data.helperDeviceId).catch(() => null);
    });

    const unsubResponderLoc = socketService.onResponderLocationUpdated((data) => {
      const respInfo = {
        helperDeviceId: data.helperDeviceId,
        distanceStr: getDistanceLabel(data.latitude, data.longitude),
        isEnRoute: true,
        latitude: data.latitude,
        longitude: data.longitude,
      };
      useEpisodeStore.getState().setResponderInfo(respInfo);
      setResponderState(respInfo);
    });

    const unsubIncomingCall = socketService.onIncomingCall((data) => {
      if (data.episodeId === episodeId) {
        receiveIncomingCall(data.episodeId, data.callerName, data.role);
        setShowCallModal(true);
      }
    });

    const pollInterval = setInterval(async () => {
      try {
        const epRes = await episodeApi.getEpisode(episodeId);
        if (epRes.success && epRes.data) {
          const epData = epRes.data as any;
          if (epData.status === 'ACCEPTED' || epData.status === 'matched' || epData.helperDeviceId) {
            setResponderState((prev) => {
              if (!prev?.isEnRoute) {
                NotificationService.notifyHelperAccepted(epData.helperDeviceId || 'Volunteer Node').catch(() => null);
              }
              const respLat = epData.helperLatitude || prev?.latitude;
              const respLng = epData.helperLongitude || prev?.longitude;
              const respInfo = {
                helperDeviceId: epData.helperDeviceId || prev?.helperDeviceId || 'Volunteer Node',
                distanceStr: getDistanceLabel(respLat, respLng),
                isEnRoute: true,
                latitude: respLat,
                longitude: respLng,
              };
              useEpisodeStore.getState().setResponderInfo(respInfo);
              return respInfo;
            });
          }
        }
      } catch (err) {
        // Ignore polling errors silently
      }
    }, 2500);

    return () => {
      clearInterval(pollInterval);
      unsub();
      unsubCancelled();
      unsubHelperAccepted();
      unsubResponderLoc();
      unsubIncomingCall();
      socketService.leaveEpisode(episodeId);
    };
  }, [episodeId, activateEpisode, navigation, cancelRequest, latitude, longitude, receiveIncomingCall]);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('Main');
    }
  };

  const handleCancel = () => {
    cancelRequest();
  };

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse1.value, [0, 1], [1, 2.5]) }],
    opacity: interpolate(pulse1.value, [0, 1], [0.6, 0]),
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse2.value, [0, 1], [1, 3.0]) }],
    opacity: interpolate(pulse2.value, [0, 1], [0.4, 0]),
  }));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.outline }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name="arrow-back" size={24} color="#EF4444" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {responderState?.isEnRoute ? 'RESPONDER EN ROUTE' : 'SEARCHING FOR RESPONDERS'}
        </Text>
        <View style={styles.headerTimerBadge}>
          <Icon name="timer" size={13} color="#EF4444" />
          <Text style={styles.headerTimerText}>WINDOW: {formatTime(timeLeft)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {responderState?.isEnRoute && latitude !== null && longitude !== null && responderState.latitude && responderState.longitude ? (
          <CircularRadarMap
            requesterLat={latitude}
            requesterLng={longitude}
            responderLat={responderState.latitude}
            responderLng={responderState.longitude}
            title="RESPONDER LIVE TELEMETRY RADAR"
          />
        ) : (
          <View style={styles.radarContainer}>
            <Animated.View
              style={[
                styles.pulseCircleOuter,
                animatedStyle2,
              ]}
            />
            <Animated.View
              style={[
                styles.pulseCircleInner,
                animatedStyle1,
              ]}
            />
            <View style={[styles.centerIconBox, responderState?.isEnRoute ? { backgroundColor: '#059669', borderColor: '#34D399' } : null]}>
              <Icon name={responderState?.isEnRoute ? "directions-walk" : "radar"} size={54} color="#FFFFFF" />
            </View>
          </View>
        )}

        <View style={styles.statusGroup}>
          <Text style={[styles.statusTitle, { color: colors.onBackground }]}>
            {responderState?.isEnRoute ? 'Volunteer Responder Responded!' : 'Broadcasting Emergency Signal'}
          </Text>
          <Text style={[styles.statusSub, { color: colors.onSurfaceVariant }]}>
            {responderState?.isEnRoute
              ? `Volunteer node (${responderState.helperDeviceId.substring(0, 8)}...) is navigating to your area. Keep your QR verification code ready.`
              : 'Transmitting anonymized location grid cell to nearby volunteer responders...'}
          </Text>
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>CATEGORY:</Text>
            <Text style={styles.detailValue}>{(category || 'GENERAL').toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>URGENCY LEVEL:</Text>
            <Text style={styles.detailValue}>LEVEL {urgency || 3}</Text>
          </View>
          {!!description && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>DETAILS:</Text>
              <Text style={[styles.detailValue, { color: colors.onBackground, flex: 1, textAlign: 'right' }]} numberOfLines={2}>
                {description}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>STATUS:</Text>
            <Text style={[styles.detailValue, responderState?.isEnRoute ? { color: '#34D399' } : null]}>
              {responderState?.isEnRoute ? 'RESPONDER APPROACHING' : 'SCANNING P2P MESH...'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>SESSION WINDOW REMAINING:</Text>
            <Text style={[styles.detailValue, { color: '#EF4444', fontWeight: 'bold' }]}>{formatTime(timeLeft)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>ELAPSED TIME:</Text>
            <Text style={[styles.detailValue, { color: colors.onBackground }]}>{formatTime(elapsedTime)}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.outline }]}>
        {responderState?.isEnRoute && (
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <StandardButton
              title="VOICE CALL"
              onPress={() => {
                const targetName = responderState?.helperDeviceId ? `Volunteer (${responderState.helperDeviceId.substring(0, 6)})` : 'Approaching Responder';
                startOutgoingCall(episodeId || '', targetName, 'requester');
                socketService.initiateCall(episodeId || '', 'Emergency Requester', 'requester');
                setShowCallModal(true);
              }}
              variant="secondary"
              style={StyleSheet.flatten([styles.qrButton, { flex: 1, borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }])}
              icon={<Icon name="call" size={18} color="#10B981" />}
            />
            <StandardButton
              title="LIVE CHAT"
              onPress={() => setShowChatModal(true)}
              variant="secondary"
              style={StyleSheet.flatten([styles.qrButton, { flex: 1, borderColor: '#3B82F6' }])}
              icon={<Icon name="chat" size={18} color="#3B82F6" />}
            />
          </View>
        )}
        <StandardButton
          title="SHOW MY VERIFICATION QR CODE"
          onPress={() => navigation.navigate('Handshake', { episodeId, role: 'requester' })}
          variant="primary"
          style={StyleSheet.flatten([styles.qrButton, { marginBottom: 12 }])}
          icon={<Icon name="qr-code" size={20} color="#FFFFFF" />}
        />
        <StandardButton
          title="CANCEL EMERGENCY BROADCAST"
          onPress={handleCancel}
          variant="secondary"
          style={styles.cancelButton}
        />
      </View>

      <EmergencyChatModal
        visible={showChatModal}
        onClose={() => setShowChatModal(false)}
        onStartCall={() => {
          setShowChatModal(false);
          setShowCallModal(true);
        }}
        episodeId={episodeId || ''}
        counterpartyName={responderState?.helperDeviceId ? `Volunteer (${responderState.helperDeviceId.substring(0, 6)})` : 'Approaching Responder'}
        role="requester"
      />

      <EmergencyCallModal
        visible={showCallModal}
        onClose={() => setShowCallModal(false)}
        onOpenChat={() => {
          setShowCallModal(false);
          setShowChatModal(true);
        }}
        episodeId={episodeId || ''}
        counterpartyName={responderState?.helperDeviceId ? `Volunteer (${responderState.helperDeviceId.substring(0, 6)})` : 'Approaching Responder'}
        role="requester"
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
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 8,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    color: '#EF4444',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  headerTimerBadge: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  headerTimerText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: '#EF4444',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    gap: 28,
  },
  radarContainer: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseCircleOuter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  pulseCircleInner: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(220, 38, 38, 0.4)',
  },
  centerIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DC2626',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  statusGroup: {
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 22,
    textAlign: 'center',
  },
  statusSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 320,
  },
  detailCard: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    letterSpacing: 1,
  },
  detailValue: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: '#EF4444',
  },
  bottomBar: {
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.containerPadding,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  cancelButton: {
    width: '100%',
    maxWidth: 440,
  },
  qrButton: {
    width: '100%',
    maxWidth: 440,
  },
});


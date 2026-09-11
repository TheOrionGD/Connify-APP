import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, actionColors, useTheme } from '../../theme';
import { useEpisodeStore } from '../../stores/episodeStore';
import { StandardButton } from '../../components/buttons/StandardButton';
import { DialogueModal } from '../../components/common/DialogueModal';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GradientView } from '../../components/common/GradientView';
import { socketService } from '../../services/socketService';
import { capsuleApi } from '../../services/api/capsuleApi';
import { NotificationService } from '../../services/NotificationService';
import { useRewardStore } from '../../stores/rewardStore';
import { EmergencyChatModal } from '../../components/chat/EmergencyChatModal';
import { EmergencyCallModal } from '../../components/call/EmergencyCallModal';
import { useCallStore } from '../../stores/callStore';

export default function EmergencyScreen({ navigation }: any) {
  const { colors } = useTheme();
  const {
    timeLeft,
    completeEpisode,
    extendTime,
    tickCountdown,
    category,
    episodeId,
    userRole,
  } = useEpisodeStore();
  const isResponder = userRole === 'responder';
  const [modalVisible, setModalVisible] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const secondaryResponders = useEpisodeStore((state) => state.secondaryResponders);
  const [_participantCount, setParticipantCount] = useState(1);
  const { startOutgoingCall, receiveIncomingCall } = useCallStore();

  useEffect(() => {
    NotificationService.notifyEpisodeStarted(15).catch(() => null);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      tickCountdown();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickCountdown]);

  useEffect(() => {
    if (!episodeId) return;

    if (!socketService.isConnected()) {
      socketService.connect();
    }

    socketService.joinEpisode(episodeId, (err) => {
      if (err) console.warn('Failed to join socket room:', err);
    });

    const unsubJoined = socketService.onUserJoined(({ deviceId }) => {
      setParticipantCount((prev) => prev + 1);
      Alert.alert(
        isResponder ? 'Peer Joined' : 'Responder Connected',
        `Device (${deviceId.substring(0, 6)}...) joined live channel.`
      );
    });

    const unsubLeft = socketService.onUserLeft(() => {
      setParticipantCount((prev) => Math.max(1, prev - 1));
    });

    const unsubExpired = socketService.onEpisodeExpired(({ message }) => {
      Alert.alert('Episode Expired', message || 'Emergency channel torn down.');
      completeEpisode();
      navigation.replace('Feedback', { role: userRole || 'requester' });
    });

    const unsubCancelled = socketService.onEpisodeCancelled(({ message }) => {
      Alert.alert('Episode Cancelled', message || 'Emergency broadcast was cancelled.');
      useEpisodeStore.getState().resetEpisode();
      navigation.replace('Main');
    });

    const unsubIncomingCall = socketService.onIncomingCall((data) => {
      if (data.episodeId === episodeId) {
        receiveIncomingCall(data.episodeId, data.callerName, data.role);
        setShowCallModal(true);
      }
    });

    return () => {
      unsubJoined();
      unsubLeft();
      unsubExpired();
      unsubCancelled();
      unsubIncomingCall();
      socketService.leaveEpisode(episodeId);
    };
  }, [episodeId, isResponder, userRole, receiveIncomingCall]);

  const handleResolve = async () => {
    completeEpisode();
    if (episodeId) {
      capsuleApi.revokeCapsule(episodeId).catch((err) => console.log('Capsule revocation status:', err.message));
    }
    useRewardStore.getState().unlockBadge(isResponder ? 'SUPPORT_OFFERED' : 'EPISODE_RESOLVED');
    NotificationService.notifyTaskCompleted(episodeId || undefined).catch(() => null);

    // Feature 17: Schedule 5-minute automated wellness check
    if (!isResponder) {
      setTimeout(() => {
        NotificationService.notifyWellnessCheckPrompt().catch(() => null);
      }, 5000);
    }

    Alert.alert(
      isResponder ? 'Assistance Completed' : 'Emergency Resolved',
      isResponder ? 'Assistance session concluded.' : 'Emergency broadcast terminated. Ephemeral channel closed.'
    );
    navigation.replace('Feedback', { role: userRole || 'requester' });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: isResponder ? '#064E3B' : actionColors.actionRed,
            borderBottomColor: isResponder ? '#059669' : actionColors.actionRed,
          },
        ]}
      >
        <Icon
          name="arrow-back"
          size={24}
          color="#FFFFFF"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>
          {isResponder ? 'ACTIVE ASSISTANCE MODE' : 'ACTIVE EMERGENCY MODE'}
        </Text>
        <View style={styles.liveBadge}>
          <Text style={[styles.liveText, isResponder ? { color: '#059669' } : null]}>LIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Urgent Alert Banner */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <GradientView
            colors={isResponder ? ['#059669', '#064E3B'] : ['#EF4444', '#991B1B']}
            style={[styles.urgentCard, isResponder ? { borderColor: '#34D399' } : null]}
          >
            <Icon name={isResponder ? 'handshake' : 'warning'} size={40} color="#FFFFFF" />
            <Text style={styles.urgentTitle}>
              {isResponder ? 'RESPONDING TO DISTRESS' : 'BROADCAST ACTIVE'}
            </Text>
            <Text style={styles.urgentSub}>
              {isResponder
                ? `ASSISTING WITH ${(category || 'EMERGENCY').toUpperCase()} DISTRESS BROADCAST`
                : `${(category || 'EMERGENCY').toUpperCase()} SIGNAL TRANSMITTING TO VOLUNTEER MESH`}
            </Text>
          </GradientView>
        </Animated.View>

        {/* Zero-Trace Ephemeral Privacy Notice */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <View style={[styles.privacyBanner, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Icon name="lock-clock" size={20} color={isResponder ? '#059669' : colors.primary} />
            <Text style={[styles.privacyBannerText, { color: colors.onSurfaceVariant }]}>
              Zero-Trace Privacy Policy: This episode session is active for help dispatch. Once concluded, all live location streaming data is immediately discarded.
            </Text>
          </View>
        </Animated.View>

        {/* Feature 9: Stalled Responder Progress Detector Chip */}
        {!isResponder && (
          <Animated.View entering={FadeInDown.duration(400).delay(180)}>
            <View style={[styles.privacyBanner, { backgroundColor: '#FEF08A', borderColor: '#EAB308' }]}>
              <Icon name="speed" size={20} color="#CA8A04" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 11, color: '#CA8A04' }}>
                  DYNAMIC ETA MONITORING ACTIVE
                </Text>
                <Text style={{ fontFamily: theme.fontFamilies.secondary.regular, fontSize: 11, color: '#854D0E', marginTop: 1 }}>
                  Responder progress is monitored in real-time. If responder movement stalls, emergency guardians will be alerted automatically.
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Feature 16: Live Safe Escort Tracking Mode Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(190)}>
          <GradientView
            colors={[colors.surfaceContainer, colors.surface]}
            style={[styles.actionCard, { borderColor: useEpisodeStore.getState().isSafeEscortActive ? '#059669' : colors.outline }]}
          >
            <View style={styles.actionHeader}>
              <Icon name="directions-walk" size={24} color={useEpisodeStore.getState().isSafeEscortActive ? '#059669' : colors.primary} />
              <Text style={[styles.actionTitle, { color: colors.onBackground }]}>
                Live Safe Escort Tracking Mode
              </Text>
            </View>
            <Text style={[styles.actionSub, { color: colors.onSurfaceVariant }]}>
              {useEpisodeStore.getState().isSafeEscortActive
                ? 'Escort tracking active. Helper and guardians monitor your live progress until you arrive safely at your destination.'
                : 'Keep location tracking active post-handshake until you safely arrive at your destination (home/hospital).'}
            </Text>
            <TouchableOpacity
              style={[
                styles.handshakeButton,
                { backgroundColor: useEpisodeStore.getState().isSafeEscortActive ? '#059669' : colors.surfaceContainerHigh, borderColor: colors.outline }
              ]}
              onPress={() => {
                const current = useEpisodeStore.getState().isSafeEscortActive;
                useEpisodeStore.getState().setSafeEscortActive(!current, 'Home / Destination');
                Alert.alert(
                  !current ? 'Safe Escort Mode Active' : 'Safe Escort Disabled',
                  !current
                    ? 'Live tracking will remain active until you confirm arrival at your destination.'
                    : 'Safe escort tracking disabled.'
                );
              }}
            >
              <Icon name={useEpisodeStore.getState().isSafeEscortActive ? 'check-circle' : 'shield'} size={18} color={useEpisodeStore.getState().isSafeEscortActive ? '#FFFFFF' : colors.primary} />
              <Text style={[styles.handshakeButtonText, { color: useEpisodeStore.getState().isSafeEscortActive ? '#FFFFFF' : colors.onBackground }]}>
                {useEpisodeStore.getState().isSafeEscortActive ? 'SAFE ESCORT ACTIVE (TAP TO DISCARD)' : 'ENABLE SAFE ESCORT MODE'}
              </Text>
            </TouchableOpacity>
          </GradientView>
        </Animated.View>

        {/* Timer Box */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <GradientView
            colors={[colors.surfaceContainer, colors.surface]}
            style={[styles.timerCard, { borderColor: colors.outline }]}
          >
            <Text style={[styles.timerLabel, { color: colors.onSurfaceVariant }]}>
              SESSION WINDOW REMAINING
            </Text>
            <Text style={[styles.timerText, { color: colors.onBackground }]}>{formatTime(timeLeft)}</Text>
            <TouchableOpacity style={[styles.extendPill, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]} onPress={() => extendTime(5)}>
              <Icon name="add-alarm" size={18} color={colors.onBackground} />
              <Text style={[styles.extendText, { color: colors.onBackground }]}>EXTEND +5 MINUTES</Text>
            </TouchableOpacity>
          </GradientView>
        </Animated.View>

        {/* Live En-Route Chat & Secondary Responders Action Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <GradientView
            colors={[colors.surfaceContainer, colors.surface]}
            style={[styles.actionCard, { borderColor: '#3B82F6' }]}
          >
            <View style={styles.actionHeader}>
              <Icon name="chat" size={24} color="#3B82F6" />
              <Text style={[styles.actionTitle, { color: colors.onBackground }]}>
                Real-Time En-Route Ephemeral Chat
              </Text>
            </View>
            <Text style={[styles.actionSub, { color: colors.onSurfaceVariant }]}>
              Encrypted, zero-trace P2P direct chat channel active with counterparty while en-route.
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <TouchableOpacity
                onPress={() => {
                  const targetName = isResponder ? 'Distress Requester' : 'Approaching Responder';
                  startOutgoingCall(episodeId || '', targetName, isResponder ? 'responder' : 'requester');
                  socketService.initiateCall(
                    episodeId || '',
                    isResponder ? 'Volunteer Responder' : 'Emergency Requester',
                    isResponder ? 'responder' : 'requester'
                  );
                  setShowCallModal(true);
                }}
                style={[styles.handshakeButton, { flex: 1, backgroundColor: '#059669', borderColor: '#10B981' }]}
              >
                <Icon name="call" size={18} color="#FFFFFF" />
                <Text style={[styles.handshakeButtonText, { color: '#FFFFFF' }]}>VOICE CALL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowChatModal(true)}
                style={[styles.handshakeButton, { flex: 1, backgroundColor: '#3B82F6', borderColor: '#3B82F6' }]}
              >
                <Icon name="forum" size={18} color="#FFFFFF" />
                <Text style={[styles.handshakeButtonText, { color: '#FFFFFF' }]}>LIVE CHAT</Text>
              </TouchableOpacity>
            </View>
          </GradientView>
        </Animated.View>

        {/* Secondary Responders Swarm Grid */}
        <Animated.View entering={FadeInDown.duration(400).delay(280)}>
          <GradientView
            colors={[colors.surfaceContainer, colors.surface]}
            style={[styles.actionCard, { borderColor: '#10B981' }]}
          >
            <View style={styles.actionHeader}>
              <Icon name="groups" size={24} color="#10B981" />
              <Text style={[styles.actionTitle, { color: colors.onBackground }]}>
                Secondary Responders Swarm Grid ({secondaryResponders.length + 1})
              </Text>
            </View>
            <Text style={[styles.actionSub, { color: colors.onSurfaceVariant }]}>
              Primary responder node matched. Additional backup volunteers act as secondary perimeter safety guardians.
            </Text>

            <View style={{ gap: 8, marginTop: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 8, backgroundColor: colors.surfaceContainerHigh }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon name="stars" size={20} color="#F59E0B" />
                  <Text style={{ fontFamily: theme.fontFamilies.primary.bold, fontSize: 13, color: colors.onBackground }}>
                    Primary Responder Node
                  </Text>
                </View>
                <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 10, color: '#10B981' }}>EN ROUTE</Text>
              </View>

              {secondaryResponders.map((sec: any) => (
                <View key={sec.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 8, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outline }}>
                  <View style={{ gap: 2 }}>
                    <Text style={{ fontFamily: theme.fontFamilies.primary.bold, fontSize: 12, color: colors.onBackground }}>
                      {sec.name} ({sec.roleTitle})
                    </Text>
                    <Text style={{ fontFamily: theme.fontFamilies.technical.medium, fontSize: 10, color: colors.onSurfaceVariant }}>
                      {sec.distanceStr} • Joined {sec.joinedAt}
                    </Text>
                  </View>
                  <Icon name="security" size={18} color="#10B981" />
                </View>
              ))}

              {secondaryResponders.length === 0 && (
                <Text style={{ fontFamily: theme.fontFamilies.secondary.regular, fontSize: 11, color: colors.onSurfaceVariant, fontStyle: 'italic' }}>
                  Scanning for secondary backup perimeter guardians...
                </Text>
              )}
            </View>
          </GradientView>
        </Animated.View>

        {/* Proximity Verification Quick Action */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <GradientView
            colors={[colors.surfaceContainer, colors.surface]}
            style={[styles.actionCard, { borderColor: colors.outline }]}
          >
            <View style={styles.actionHeader}>
              <Icon name="qr-code-scanner" size={24} color={colors.primary} />
              <Text style={[styles.actionTitle, { color: colors.onBackground }]}>
                {isResponder ? 'Proximity Scanner & Decryptor' : 'Identity Verification Handshake'}
              </Text>
            </View>
            <Text style={[styles.actionSub, { color: colors.onSurfaceVariant }]}>
              {isResponder
                ? 'Scan the requester’s QR code to decrypt metadata and complete zero-trust handshake.'
                : 'Perform zero-trust QR or cryptographic handshake when responder arrives.'}
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Handshake', {
                  episodeId: useEpisodeStore.getState().episodeId,
                  role: isResponder ? 'helper' : 'requester',
                })
              }
            >
              <GradientView
                colors={isResponder ? ['#059669', '#064E3B'] : ['#EF4444', '#991B1B']}
                style={styles.handshakeButton}
              >
                <Text style={styles.handshakeButtonText}>
                  {isResponder ? 'SCAN REQUESTER QR CODE' : 'LAUNCH HANDSHAKE'}
                </Text>
                <Icon name="arrow-forward" size={16} color="#FFFFFF" />
              </GradientView>
            </TouchableOpacity>
          </GradientView>
        </Animated.View>

        {/* Offline Fallback Modules */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <GradientView
            colors={[colors.surfaceContainer, colors.surface]}
            style={[styles.actionCard, { borderColor: colors.outline }]}
          >
            <View style={styles.actionHeader}>
              <Icon name="wifi-off" size={24} color={colors.onSurfaceVariant} />
              <Text style={[styles.actionTitle, { color: colors.onBackground }]}>Emergency Communications</Text>
            </View>
            <TouchableOpacity
              style={[styles.handshakeButton, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}
              onPress={() => navigation.navigate('GovernmentEmergencyNumbers')}
            >
              <Icon name="local-police" size={16} color="#3B82F6" />
              <Text style={[styles.handshakeButtonText, { color: colors.onBackground }]}>GOVERNMENT AUTHORITIES</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.handshakeButton, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline, marginTop: 8 }]}
              onPress={() => navigation.navigate('EmergencyContacts')}
            >
              <Icon name="contact-phone" size={16} color="#10B981" />
              <Text style={[styles.handshakeButtonText, { color: colors.onBackground }]}>PERSONAL CONTACTS</Text>
            </TouchableOpacity>
          </GradientView>
        </Animated.View>

        {/* Action Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          {isResponder ? (
            <StandardButton
              title="COMPLETE ASSISTANCE & LEAVE SESSION"
              onPress={() => setModalVisible(true)}
              style={StyleSheet.flatten([styles.resolveButton, { backgroundColor: '#059669' }])}
            />
          ) : (
            <StandardButton
              title="I AM SAFE — RESOLVE EMERGENCY"
              onPress={() => setModalVisible(true)}
              style={styles.resolveButton}
            />
          )}
        </Animated.View>
      </ScrollView>

      <DialogueModal
        visible={modalVisible}
        title={isResponder ? 'Complete Assistance' : 'Resolve Emergency Episode'}
        message={
          isResponder
            ? 'Are you sure you want to complete your volunteer assistance and leave this session?'
            : 'Are you sure you want to mark yourself as safe and terminate the emergency signal broadcast?'
        }
        onClose={() => setModalVisible(false)}
        confirmText={isResponder ? 'Confirm Finish' : 'Confirm Safe'}
        onConfirm={handleResolve}
        cancelText="Cancel"
      />

      <EmergencyChatModal
        visible={showChatModal}
        onClose={() => setShowChatModal(false)}
        onStartCall={() => {
          setShowChatModal(false);
          setShowCallModal(true);
        }}
        episodeId={episodeId || ''}
        counterpartyName={isResponder ? 'Distress Requester' : 'Approaching Responder'}
        role={isResponder ? 'responder' : 'requester'}
      />

      <EmergencyCallModal
        visible={showCallModal}
        onClose={() => setShowCallModal(false)}
        onOpenChat={() => {
          setShowCallModal(false);
          setShowChatModal(true);
        }}
        episodeId={episodeId || ''}
        counterpartyName={isResponder ? 'Distress Requester' : 'Approaching Responder'}
        role={isResponder ? 'responder' : 'requester'}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.containerPadding,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  liveBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: '#DC2626',
  },
  container: {
    padding: theme.spacing.containerPadding,
    gap: 18,
  },
  urgentCard: {
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },

  urgentTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  urgentSub: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  timerCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  timerLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  timerText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 48,
    fontWeight: '800',
  },
  extendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  extendText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
  },
  actionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 15,
  },
  actionSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  handshakeButton: {
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  handshakeButtonText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  privacyBannerText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  resolveButton: {
    marginTop: 8,
  },
});

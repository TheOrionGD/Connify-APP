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

export default function EmergencyScreen({ navigation }: any) {
  const { colors } = useTheme();
  const {
    currentState,
    timeLeft,
    completeEpisode,
    extendTime,
    tickCountdown,
    category,
    episodeId,
  } = useEpisodeStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);

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
      Alert.alert('Responder Connected', `Volunteer node (${deviceId.substring(0, 6)}...) joined your live emergency channel.`);
    });

    const unsubLeft = socketService.onUserLeft(() => {
      setParticipantCount((prev) => Math.max(1, prev - 1));
    });

    const unsubExpired = socketService.onEpisodeExpired(({ message }) => {
      Alert.alert('Episode Expired', message || 'Emergency channel torn down.');
      completeEpisode();
      navigation.replace('Feedback');
    });

    return () => {
      unsubJoined();
      unsubLeft();
      unsubExpired();
      socketService.leaveEpisode(episodeId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId]);

  const handleResolve = async () => {
    completeEpisode();
    if (episodeId) {
      capsuleApi.revokeCapsule(episodeId).catch((err) => console.log('Capsule revocation status:', err.message));
    }
    Alert.alert('Emergency Resolved', 'Emergency broadcast terminated. Ephemeral channel closed.');
    navigation.replace('Feedback');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: actionColors.actionRed, borderBottomColor: actionColors.actionRed }]}>
        <Icon
          name="arrow-back"
          size={24}
          color="#FFFFFF"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>ACTIVE EMERGENCY MODE</Text>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Urgent Alert Banner */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <GradientView
            colors={['#EF4444', '#991B1B']}
            style={styles.urgentCard}
          >
            <Icon name="warning" size={40} color="#FFFFFF" />
            <Text style={styles.urgentTitle}>BROADCAST ACTIVE</Text>
            <Text style={styles.urgentSub}>
              {(category || 'EMERGENCY').toUpperCase()} SIGNAL TRANSMITTING TO VOLUNTEER MESH
            </Text>
          </GradientView>
        </Animated.View>

        {/* Timer Box */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <GradientView
            colors={[colors.surfaceContainer, colors.surface]}
            style={[styles.timerCard, { borderColor: colors.outline }]}
          >
            <Text style={[styles.timerLabel, { color: colors.onSurfaceVariant }]}>SAFE TIME REMAINING</Text>
            <Text style={[styles.timerText, { color: colors.onBackground }]}>{formatTime(timeLeft)}</Text>
            <TouchableOpacity style={[styles.extendPill, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]} onPress={() => extendTime(5)}>
              <Icon name="add-alarm" size={18} color={colors.onBackground} />
              <Text style={[styles.extendText, { color: colors.onBackground }]}>EXTEND +5 MINUTES</Text>
            </TouchableOpacity>
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
              <Text style={[styles.actionTitle, { color: colors.onBackground }]}>Identity Verification Handshake</Text>
            </View>
            <Text style={[styles.actionSub, { color: colors.onSurfaceVariant }]}>
              Perform zero-trust QR or cryptographic handshake when responder arrives.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Handshake', { episodeId: useEpisodeStore.getState().episodeId, role: 'requester' })}
            >
              <GradientView
                colors={['#EF4444', '#991B1B']}
                style={styles.handshakeButton}
              >
                <Text style={styles.handshakeButtonText}>LAUNCH HANDSHAKE</Text>
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
              <Text style={[styles.actionTitle, { color: colors.onBackground }]}>Offline Fallback Options</Text>
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

        {/* Resolve Emergency Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <StandardButton
            title="I AM SAFE — RESOLVE EMERGENCY"
            onPress={() => setModalVisible(true)}
            style={styles.resolveButton}
          />
        </Animated.View>
      </ScrollView>


      <DialogueModal
        visible={modalVisible}
        title="Resolve Emergency Episode"
        message="Are you sure you want to mark yourself as safe and terminate the emergency signal broadcast?"
        onClose={() => setModalVisible(false)}
        confirmText="Confirm Safe"
        onConfirm={handleResolve}
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
  resolveButton: {
    marginTop: 8,
  },
});

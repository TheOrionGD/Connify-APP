import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { SOSButton } from '../../components/buttons/SOSButton';
import { SafetyCard } from '../../components/cards/SafetyCard';
import { StandardCard } from '../../components/cards/StandardCard';
import { DialogueModal } from '../../components/common/DialogueModal';
import { ProfileSetupModal } from '../../components/common/ProfileSetupModal';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useEpisodeStore } from '../../stores/episodeStore';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';

export default function DashboardScreen({ navigation }: any) {
  const [activeMode, setActiveMode] = useState<'need-help' | 'can-help'>('need-help');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [onAckCallback, setOnAckCallback] = useState<(() => void) | null>(null);
  
  const { hasCompletedProfile, deviceId } = useAuthStore();
  const { latitude, longitude } = useLocationStore();

  const {
    currentState,
    timeLeft,
    startRequest,
    extendTime,
    completeEpisode,
    tickCountdown,
  } = useEpisodeStore();

  useEffect(() => {
    if (currentState === 'searching') {
      navigation.navigate('Searching');
    } else if (currentState === 'feedback') {
      navigation.navigate('Feedback');
    }
  }, [currentState, navigation]);

  useEffect(() => {
    let timer: any;
    if (currentState === 'active' && timeLeft > 0) {
      timer = setInterval(() => {
        tickCountdown();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentState, timeLeft, tickCountdown]);

  const triggerSOS = () => {
    setAlertTitle('Emergency Signal Broadcasted');
    setAlertMessage(
      'Your emergency alarm has been broadcasted to nearby verified responders and your registered emergency trust contacts.'
    );
    setOnAckCallback(() => () => {
      startRequest('Security', 5, 'Immediate Safety Signal', latitude || 0, longitude || 0);
    });
    setAlertVisible(true);
  };

  const handleImSafe = () => {
    completeEpisode();
    if (!hasCompletedProfile) {
      setShowProfileModal(true);
    } else {
      setAlertTitle('Episode Resolved');
      setAlertMessage('You have marked yourself as safe. Emergency broadcast closed and location lock released.');
      setAlertVisible(true);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const timerTextValue = formatTime(timeLeft);
  const progressRatio = Math.min(1, timeLeft / 600);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Icon name="security" size={24} color={theme.colors.primary} />
          <Text style={styles.headerText}>Connify Safety</Text>
        </View>
        <TouchableOpacity
          style={styles.emergencyBadge}
          onPress={() => navigation.navigate('EmergencySOS')}
        >
          <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Role Toggle Switcher */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              activeMode === 'need-help' ? styles.roleButtonActive : null,
            ]}
            onPress={() => setActiveMode('need-help')}
          >
            <Text
              style={[
                styles.roleText,
                activeMode === 'need-help' ? styles.roleTextActive : null,
              ]}
            >
              I NEED HELP
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleButton,
              activeMode === 'can-help' ? styles.roleButtonActive : null,
            ]}
            onPress={() => {
              setActiveMode('can-help');
              navigation.navigate('Respond');
            }}
          >
            <Text
              style={[
                styles.roleText,
                activeMode === 'can-help' ? styles.roleTextActive : null,
              ]}
            >
              I CAN HELP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live GPS Location Bar */}
        <View style={styles.locationBar}>
          <Icon name="my-location" size={20} color={theme.colors.primary} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>ACTIVE GPS LOCATION</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {latitude !== null && longitude !== null ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'Acquiring GPS location...'}
            </Text>
          </View>
        </View>

        {activeMode === 'need-help' ? (
          <>
            {currentState === 'active' ? (
              <SafetyCard style={styles.activeSessionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderTitle}>
                    <Icon name="error" size={22} color={theme.colors.primary} />
                    <Text style={styles.activeSessionText}>ACTIVE EMERGENCY EPISODE</Text>
                  </View>
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                </View>

                <View style={styles.timerContainer}>
                  <View>
                    <Text style={styles.timerLabel}>EPISODE TIME REMAINING</Text>
                    <Text style={styles.timerText}>{timerTextValue}</Text>
                  </View>
                  <View style={styles.timerIconWrapper}>
                    <Icon name="timer" size={28} color={theme.colors.primary} />
                  </View>
                </View>

                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.cardButton} onPress={handleImSafe}>
                    <Icon name="check-circle" size={18} color={theme.colors.onBackground} />
                    <Text style={styles.cardButtonText}>I'M SAFE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cardButton} onPress={() => extendTime(5)}>
                    <Icon name="add" size={18} color={theme.colors.onBackground} />
                    <Text style={styles.cardButtonText}>+5 MIN</Text>
                  </TouchableOpacity>
                </View>
              </SafetyCard>
            ) : (
              <View style={styles.sosContainer}>
                <SOSButton onTrigger={triggerSOS} />
                <Text style={styles.sosSubtext}>
                  Press and hold SOS to dispatch emergency signal to nearest volunteer mesh & emergency contacts.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Icon name="radar" size={56} color={theme.colors.onBackground} />
            <Text style={styles.emptyStateTitle}>Volunteer Response Mode</Text>
            <Text style={styles.emptyStateSub}>
              Switch to the RESPOND tab to view real-time emergency broadcasts in your nearby geographic area.
            </Text>
            <TouchableOpacity
              style={styles.actionPill}
              onPress={() => navigation.navigate('Respond')}
            >
              <Text style={styles.actionPillText}>VIEW NEARBY FEED</Text>
              <Icon name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Protection Quick Stats */}
        <View style={styles.statsGrid}>
          <StandardCard style={styles.statCard}>
            <Icon name="fingerprint" size={22} color={theme.colors.primary} />
            <View style={styles.statContent}>
              <Text style={styles.statValue} numberOfLines={1}>
                {deviceId ? `ed25519 (${deviceId.substring(0, 6)}...)` : 'ed25519 (4a2f8b...)'}
              </Text>
              <Text style={styles.statLabel}>DEVICE ID LOCK</Text>
            </View>
          </StandardCard>

          <StandardCard style={styles.statCard}>
            <Icon name="explore" size={22} color="#FFFFFF" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>500m</Text>
              <Text style={styles.statLabel}>GRID CELL MESH</Text>
            </View>
          </StandardCard>

          <TouchableOpacity
            style={styles.bannerContainer}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Governance')}
          >
            <View style={styles.bannerIconWrapper}>
              <Icon name="gavel" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>ZERO-TRUST GOVERNANCE</Text>
              <Text style={styles.bannerText}>Inspect cryptography & privacy guarantees.</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* CTA to Create Custom Request */}
        <TouchableOpacity
          style={styles.createRequestCTA}
          onPress={() => navigation.navigate('CreateRequest')}
        >
          <Text style={styles.createRequestCTAText}>BROADCAST CUSTOM HELP REQUEST</Text>
          <Icon name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>

      <DialogueModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => {
          setAlertVisible(false);
          if (onAckCallback) {
            const cb = onAckCallback;
            setOnAckCallback(null);
            cb();
          }
        }}
        onConfirm={() => {
          setAlertVisible(false);
          if (onAckCallback) {
            const cb = onAckCallback;
            setOnAckCallback(null);
            cb();
          }
        }}
        confirmText="Acknowledge"
      />

      <FeedbackModal
        visible={showFeedbackModal}
        onComplete={() => {
          setShowFeedbackModal(false);
          setShowProfileModal(true);
        }}
      />

      <ProfileSetupModal
        visible={showProfileModal}
        onComplete={() => {
          setShowProfileModal(false);
          setAlertTitle('Profile Saved');
          setAlertMessage('Your profile data has been securely saved to MongoDB Atlas.');
          setAlertVisible(true);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050506',
  },
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    backgroundColor: '#050506',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 20,
    color: '#DC2626',
    fontWeight: '800',
  },
  emergencyBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  emergencyBadgeText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.containerPadding,
    paddingVertical: theme.spacing.stackGap,
    gap: theme.spacing.stackGap,
  },
  roleContainer: {
    backgroundColor: '#0E1320',
    padding: 4,
    borderRadius: 14,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  roleButtonActive: {
    backgroundColor: '#DC2626',
  },
  roleText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0E1320',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: '#EF4444',
    letterSpacing: 0.8,
  },
  locationValue: {
    fontFamily: theme.fontFamilies.secondary.medium,
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 2,
  },
  activeSessionCard: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeSessionText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 14,
    color: '#EF4444',
  },
  liveBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: theme.fontFamilies.technical.bold,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  timerLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  timerText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 32,
    color: '#FFFFFF',
    marginTop: 2,
  },
  timerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#161C2E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#DC2626',
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.inlineGap,
    marginTop: 4,
  },
  cardButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#161C2E',
  },
  cardButtonText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  sosContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 14,
  },
  sosSubtext: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  emptyStateContainer: {
    backgroundColor: '#0E1320',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  emptyStateSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    lineHeight: 20,
    color: '#94A3B8',
    textAlign: 'center',
  },
  actionPill: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  actionPillText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    gap: 6,
    padding: 14,
  },
  statContent: {
    marginTop: 2,
  },
  statValue: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  statLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  bannerContainer: {
    width: '100%',
    backgroundColor: '#0E1320',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#161C2E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bannerText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  createRequestCTA: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  createRequestCTAText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    letterSpacing: 0.5,
  },
});

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
    startRequest('Security', 5, 'Immediate Safety Signal', latitude || 0, longitude || 0);
    setAlertTitle('Emergency Signal Broadcasted');
    setAlertMessage(
      'Your emergency alarm has been broadcasted to nearby verified responders and your registered emergency trust contacts.'
    );
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
                {deviceId ? `${deviceId.substring(0, 7)}...` : 'Ed25519'}
              </Text>
              <Text style={styles.statLabel}>DEVICE ID LOCK</Text>
            </View>
          </StandardCard>

          <StandardCard style={styles.statCard}>
            <Icon name="explore" size={22} color={theme.colors.onBackground} />
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
              <Icon name="gavel" size={22} color={theme.colors.onBackground} />
            </View>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>ZERO-TRUST GOVERNANCE</Text>
              <Text style={styles.bannerText}>Inspect cryptography & privacy guarantees.</Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.colors.onBackground} />
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
        onClose={() => setAlertVisible(false)}
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
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 56,
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.outline,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    backgroundColor: theme.colors.background,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  emergencyBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.spacing.radiusFull,
    borderWidth: 1,
    borderColor: theme.colors.outline,
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
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 4,
    borderRadius: theme.spacing.radiusDefault,
    flexDirection: 'row',
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  roleButtonActive: {
    backgroundColor: theme.colors.onBackground,
  },
  roleText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: theme.colors.onBackground,
    letterSpacing: 0.5,
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.spacing.radiusDefault,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: theme.colors.primary,
    letterSpacing: 0.8,
  },
  locationValue: {
    fontFamily: theme.fontFamilies.secondary.medium,
    fontSize: 13,
    color: theme.colors.onBackground,
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
    color: theme.colors.primary,
  },
  liveBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.spacing.radiusFull,
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
    color: theme.colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  timerText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 32,
    color: theme.colors.onBackground,
    marginTop: 2,
  },
  timerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: theme.spacing.radiusFull,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.inlineGap,
    marginTop: 4,
  },
  cardButton: {
    flex: 1,
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  cardButtonText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: theme.colors.onBackground,
  },
  sosContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 14,
  },
  sosSubtext: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  emptyStateContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusMd,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 18,
    color: theme.colors.onBackground,
  },
  emptyStateSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  actionPill: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.spacing.radiusFull,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.outline,
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
    fontSize: 20,
    color: theme.colors.onBackground,
  },
  statLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  bannerContainer: {
    width: '100%',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusMd,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: theme.colors.onBackground,
    letterSpacing: 0.5,
  },
  bannerText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 1,
  },
  createRequestCTA: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.spacing.radiusDefault,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: theme.colors.outline,
  },
  createRequestCTAText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    letterSpacing: 0.5,
  },
});

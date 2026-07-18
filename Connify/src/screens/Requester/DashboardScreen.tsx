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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useEpisodeStore } from '../../stores/episodeStore';
import { useAuthStore } from '../../stores/authStore';

export default function DashboardScreen({ navigation }: any) {
  const [activeMode, setActiveMode] = useState<'need-help' | 'can-help'>('need-help');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const { hasCompletedProfile } = useAuthStore();

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
    startRequest('Security', 5, 'Silent SOS Triggered');
    setAlertTitle('Emergency Broadcast Sent');
    setAlertMessage(
      'A silent emergency alarm has been broadcasted to your 5 trust circles and nearest volunteer responders.'
    );
    setAlertVisible(true);
  };

  const handleImSafe = () => {
    completeEpisode();
    if (!hasCompletedProfile) {
      setShowProfileModal(true);
    } else {
      setAlertTitle('Session Terminated');
      setAlertMessage('You have successfully marked yourself as safe. Broadcast closed.');
      setAlertVisible(true);
    }
  };

  // Convert timeLeft (seconds) to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const timerTextValue = formatTime(timeLeft);
  const progressRatio = Math.min(1, timeLeft / 600);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TopAppBar */}
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
            onPress={() => {
              setActiveMode('need-help');
              // Auto-navigate to request or stay on dashboard
            }}
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
              navigation.navigate('NearbyRequests');
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

        {activeMode === 'need-help' ? (
          <>
            {currentState === 'active' ? (
              /* Active Episode Card (High Priority SafetyCard) */
              <SafetyCard style={styles.activeSessionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderTitle}>
                    <Icon name="error" size={22} color={theme.colors.primary} />
                    <Text style={styles.activeSessionText}>ACTIVE SAFETY SESSION</Text>
                  </View>
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                </View>

                <View style={styles.timerContainer}>
                  <View>
                    <Text style={styles.timerLabel}>TIME REMAINING</Text>
                    <Text style={styles.timerText}>{timerTextValue}</Text>
                  </View>
                  <View style={styles.timerIconWrapper}>
                    <Icon name="timer" size={32} color={theme.colors.primary} />
                  </View>
                </View>

                {/* Custom Progress Bar */}
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
                </View>

                {/* Action Buttons inside Card */}
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
              /* Large SOS Button Container */
              <View style={styles.sosContainer}>
                <SOSButton onTrigger={triggerSOS} />
                <Text style={styles.sosSubtext}>
                  Silent alarm will notify 5 trust circles and nearest responders.
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {currentState === 'active' ? (
              /* Active Episode Helper Card */
              <SafetyCard style={styles.activeSessionCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderTitle}>
                    <Icon name="verified-user" size={22} color={theme.colors.primary} />
                    <Text style={styles.activeSessionText}>RESPONDING TO EMERGENCY</Text>
                  </View>
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                </View>

                <View style={styles.timerContainer}>
                  <View>
                    <Text style={styles.timerLabel}>SAFE TIME REMAINING</Text>
                    <Text style={styles.timerText}>{timerTextValue}</Text>
                  </View>
                  <View style={styles.timerIconWrapper}>
                    <Icon name="directions-walk" size={32} color={theme.colors.primary} />
                  </View>
                </View>

                {/* Requester Profile Card */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.outlineVariant }}>
                  <Icon name="account-circle" size={40} color={theme.colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: theme.fontFamilies.primary.bold, fontSize: 15, color: theme.colors.onBackground }}>Elena Vance</Text>
                    <Text style={{ fontFamily: theme.fontFamilies.secondary.regular, fontSize: 12, color: theme.colors.onSurfaceVariant }}>Verified Requester</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                      <Icon name="call" size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                      <Icon name="chat" size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Trust Capsule Token Status */}
                <View style={{ padding: 12, backgroundColor: theme.colors.secondaryContainer, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.secondary }}>
                  <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 11, color: theme.colors.onBackground, letterSpacing: 0.5 }}>ACTIVE JIT TRUST CAPSULE (VERIFIED)</Text>
                  <Text style={{ fontFamily: theme.fontFamilies.technical.regular, fontSize: 11, color: '#00FF00', backgroundColor: '#1E1E1E', padding: 6, borderRadius: 4, marginTop: 6, textAlign: 'center' }}>
                    {`connify-capsule:${useEpisodeStore.getState().episodeId?.substring(0, 18)}...`}
                  </Text>
                </View>

                {/* Complete Episode Button */}
                <TouchableOpacity style={styles.createRequestCTA} onPress={handleImSafe}>
                  <Text style={styles.createRequestCTAText}>COMPLETE EPISODE</Text>
                  <Icon name="check-circle" size={18} color={theme.colors.onPrimary} />
                </TouchableOpacity>
              </SafetyCard>
            ) : (
              <View style={{ paddingVertical: 40, alignItems: 'center', gap: 16 }}>
                <Icon name="map" size={64} color={theme.colors.secondary} />
                <Text style={{ fontFamily: theme.fontFamilies.primary.bold, fontSize: 18, color: theme.colors.onBackground, textAlign: 'center' }}>No Active Response</Text>
                <Text style={{ fontFamily: theme.fontFamilies.secondary.regular, fontSize: 14, color: theme.colors.onSurfaceVariant, textAlign: 'center', paddingHorizontal: 20 }}>
                  You are not currently responding to any active episodes. Check the nearby requests feed to offer support.
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  onPress={() => navigation.navigate('NearbyRequests')}
                >
                  <Text style={{ color: '#ffffff', fontFamily: theme.fontFamilies.technical.bold, fontSize: 13, letterSpacing: 0.5 }}>VIEW NEARBY FEED</Text>
                  <Icon name="arrow-forward" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Nearby Safety Stats (Bento Style Grid) */}
        <View style={styles.statsGrid}>
          {/* Stat Item 1 */}
          <StandardCard style={styles.statCard}>
            <Icon name="shield" size={24} color={theme.colors.tertiary} />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>14</Text>
              <Text style={styles.statLabel}>TRUSTED PEERS</Text>
            </View>
          </StandardCard>

          {/* Stat Item 2 */}
          <StandardCard style={styles.statCard}>
            <Icon name="share-location" size={24} color={theme.colors.primary} />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>2.4km</Text>
              <Text style={styles.statLabel}>RADIUS GUARD</Text>
            </View>
          </StandardCard>

          {/* Bottom Bento Banner Span-2 */}
          <View style={styles.bannerContainer}>
            <View style={styles.bannerIconWrapper}>
              <Icon name="verified-user" size={24} color={theme.colors.onBackground} />
            </View>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>SAFE PASSAGE ACTIVE</Text>
              <Text style={styles.bannerText}>High volunteer density in your area.</Text>
            </View>
          </View>
        </View>

        {/* CTA to Create incident request */}
        <TouchableOpacity
          style={styles.createRequestCTA}
          onPress={() => navigation.navigate('CreateRequest')}
        >
          <Text style={styles.createRequestCTAText}>CREATE CUSTOM HELP REQUEST</Text>
          <Icon name="arrow-forward" size={18} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Dialogue Modal */}
      <DialogueModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        confirmText="Acknowledge"
      />

      <ProfileSetupModal
        visible={showProfileModal}
        onComplete={() => {
          setShowProfileModal(false);
          setAlertTitle('Profile Saved');
          setAlertMessage('Thank you for completing your profile! You have successfully marked yourself as safe. Broadcast closed.');
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
    height: 64,
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.outlineVariant,
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
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.spacing.radiusFull,
  },
  emergencyBadgeText: {
    color: theme.colors.onPrimaryContainer,
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.containerPadding,
    paddingVertical: theme.spacing.stackGap,
    gap: theme.spacing.stackGap,
  },
  roleContainer: {
    backgroundColor: theme.colors.secondaryContainer,
    padding: 4,
    borderRadius: theme.spacing.radiusMd,
    flexDirection: 'row',
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.secondary,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.spacing.radiusDefault,
  },
  roleButtonActive: {
    backgroundColor: theme.colors.surfaceContainerLowest, // white highlight
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.onBackground,
  },
  roleText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    color: theme.colors.secondary,
    letterSpacing: 0.5,
  },
  roleTextActive: {
    color: theme.colors.onBackground,
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
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.spacing.radiusFull,
  },
  liveText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: theme.fontFamilies.technical.bold,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.colors.secondaryContainer,
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
    borderColor: theme.colors.onBackground,
    borderRadius: theme.spacing.radiusDefault,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  cardButtonText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: theme.colors.onBackground,
  },
  sosContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 16,
  },
  sosSubtext: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    gap: 8,
    padding: 16,
  },
  statContent: {
    marginTop: 4,
  },
  statValue: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 24,
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
    backgroundColor: theme.colors.secondaryFixed,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.onBackground,
    borderRadius: theme.spacing.radiusMd,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceContainerLowest, // white
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.onBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: theme.colors.onBackground,
    letterSpacing: 0.5,
  },
  bannerText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  createRequestCTA: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: theme.spacing.radiusFull,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  createRequestCTAText: {
    color: theme.colors.onPrimary,
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

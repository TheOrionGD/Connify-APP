import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme, actionColors } from '../../theme';
import { StandardCard } from '../../components/cards/StandardCard';
import { DialogueModal } from '../../components/common/DialogueModal';
import { ProfileSetupModal } from '../../components/common/ProfileSetupModal';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useEpisodeStore } from '../../stores/episodeStore';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GradientView } from '../../components/common/GradientView';
import PulseRipple from '../../components/animations/PulseRipple';


export default function DashboardScreen({ navigation }: any) {
  const [activeMode, setActiveMode] = useState<'need-help' | 'can-help'>('need-help');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [onAckCallback, setOnAckCallback] = useState<(() => void) | null>(null);
  
  const { colors } = useTheme();
  const { hasCompletedProfile, deviceId } = useAuthStore();
  const { latitude, longitude, startWatchingLocation } = useLocationStore();

  const {
    currentState,
    timeLeft,
    extendTime,
    completeEpisode,
    tickCountdown,
  } = useEpisodeStore();

  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    startWatchingLocation();
  }, [startWatchingLocation]);

  useEffect(() => {
    if (currentState === 'searching') {
      navigation.navigate('Searching');
    } else if (currentState === 'feedback') {
      navigation.navigate('Feedback');
    }
  }, [currentState, navigation]);

  useEffect(() => {
    let timer: any;
    if (currentState === 'active') {
      timer = setInterval(() => {
        tickCountdown();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentState, tickCountdown]);

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.outline }]}>
        <View style={styles.headerTitleContainer}>
          <Icon name="security" size={24} color={colors.primary} />
          <Text style={[styles.headerText, { color: colors.primary }]}>Connify Safety</Text>
        </View>
        <Icon name="people-outline" size={24} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: tabBarHeight + 16 }]} showsVerticalScrollIndicator={false}>
        {/* Role Toggle Switcher */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={[styles.roleContainer, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
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
                activeMode === 'need-help' ? { color: '#FFFFFF' } : { color: colors.onSurfaceVariant },
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
                activeMode === 'can-help' ? { color: '#FFFFFF' } : { color: colors.onSurfaceVariant },
              ]}
            >
              I CAN HELP
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Live GPS Location Bar */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={[styles.locationBar, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <Icon name="my-location" size={20} color={colors.primary} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>ACTIVE GPS LOCATION</Text>
            <Text style={[styles.locationValue, { color: colors.onBackground }]} numberOfLines={1}>
              {latitude !== null && longitude !== null && !(latitude === 0 && longitude === 0)
                ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                : 'Acquiring GPS location...'}
            </Text>
          </View>
        </Animated.View>

        {!hasCompletedProfile && (
          <Animated.View entering={FadeInDown.duration(400).delay(250)} style={[styles.setupBanner, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <View style={styles.setupBannerHeader}>
              <Icon name="shield" size={20} color="#059669" />
              <Text style={[styles.setupBannerTitle, { color: colors.onBackground }]}>Mesh Active • Profile Incomplete</Text>
            </View>
            <Text style={[styles.setupBannerText, { color: colors.onSurfaceVariant }]}>
              You have basic mesh access. <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Warning:</Text> You will lose access to offline cellular SOS fallback during internet blackouts if your profile remains incomplete.
            </Text>
            <View style={styles.progressRow}>
              <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceContainerHigh, flex: 1, marginRight: 10 }]}>
                <View style={[styles.progressBarFill, { width: '50%', backgroundColor: '#059669' }]} />
              </View>
              <Text style={[styles.progressText, { color: colors.onSurfaceVariant }]}>50% Complete</Text>
            </View>
            <TouchableOpacity style={[styles.setupBannerBtn, { backgroundColor: colors.primary }]} onPress={() => setShowProfileModal(true)}>
              <Text style={styles.setupBannerBtnText}>SECURE MY DEVICE</Text>
            </TouchableOpacity>
          </Animated.View>
        )}


        {activeMode === 'need-help' ? (
          <>
            {currentState === 'active' ? (
              <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                <GradientView
                  colors={[colors.surfaceContainer, colors.surface]}
                  style={[styles.activeSessionCard, { borderWidth: 1, borderColor: colors.outline, borderRadius: 16, padding: 16 }]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderTitle}>
                      <Icon name="error" size={22} color={colors.primary} />
                      <Text style={[styles.activeSessionText, { color: colors.primary }]}>ACTIVE EMERGENCY EPISODE</Text>
                    </View>
                    <View style={styles.liveBadgeWrapper}>
                      <View style={styles.pulseContainer}>
                        <PulseRipple color={actionColors.actionRed} size={40} />
                      </View>
                      <View style={styles.liveBadge}>
                        <Text style={styles.liveText}>LIVE</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.timerContainer}>
                    <View>
                      <Text style={[styles.timerLabel, { color: colors.onSurfaceVariant }]}>EPISODE TIME REMAINING</Text>
                      <Text style={[styles.timerText, { color: colors.onBackground }]}>{timerTextValue}</Text>
                    </View>
                    <View style={[styles.timerIconWrapper, { borderColor: colors.primary }]}>
                      <Icon name="timer" size={28} color={colors.primary} />
                    </View>
                  </View>

                  <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceContainerHigh }]}>
                    <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity style={[styles.cardButton, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]} onPress={handleImSafe}>
                      <Icon name="check-circle" size={18} color={colors.onBackground} />
                      <Text style={[styles.cardButtonText, { color: colors.onBackground }]}>I'M SAFE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.cardButton, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]} onPress={() => extendTime(5)}>
                      <Icon name="add" size={18} color={colors.onBackground} />
                      <Text style={[styles.cardButtonText, { color: colors.onBackground }]}>+5 MIN</Text>
                    </TouchableOpacity>
                  </View>
                </GradientView>
              </Animated.View>
            ) : (
              <Animated.View
                entering={FadeInDown.duration(400).delay(300)}
                style={[styles.connectionHelpContainer, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}
              >
                <View style={[styles.connectionHelpIcon, { backgroundColor: colors.surfaceContainerHigh }]}>
                  <Icon name="people" size={30} color={colors.primary} />
                </View>
                <Text style={[styles.connectionHelpTitle, { color: colors.onBackground }]}>Connect with a nearby helper</Text>
                <Text style={[styles.connectionHelpText, { color: colors.onSurfaceVariant }]}> 
                  Share what kind of assistance you need and connect with a stranger nearby.
                </Text>
                <TouchableOpacity
                  style={[styles.connectionHelpButton, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate('CreateRequest')}
                >
                  <Text style={styles.connectionHelpButtonText}>REQUEST NEARBY HELP</Text>
                  <Icon name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </>

        ) : (
          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <GradientView
              colors={[colors.surfaceContainer, colors.surface]}
              style={[styles.emptyStateContainer, { borderColor: colors.outline }]}
            >
              <Icon name="radar" size={56} color={colors.onBackground} />
              <Text style={[styles.emptyStateTitle, { color: colors.onBackground }]}>Volunteer Response Mode</Text>
              <Text style={[styles.emptyStateSub, { color: colors.onSurfaceVariant }]}>
                Switch to the RESPOND tab to view real-time emergency broadcasts in your nearby geographic area.
              </Text>
              <TouchableOpacity
                style={styles.actionPill}
                onPress={() => navigation.navigate('Respond')}
              >
                <Text style={styles.actionPillText}>VIEW NEARBY FEED</Text>
                <Icon name="arrow-forward" size={16} color="#000000" />
              </TouchableOpacity>
            </GradientView>
          </Animated.View>
        )}

        {/* Protection Quick Stats */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.statsGrid}>
          <StandardCard style={styles.statCard}>
            <Icon name="fingerprint" size={22} color={colors.primary} />
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.onBackground }]} numberOfLines={1}>
                {deviceId ? `ed25519 (${deviceId.substring(0, 6)}...)` : 'ed25519 (4a2f8b...)'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>DEVICE ID LOCK</Text>
            </View>
          </StandardCard>

          <StandardCard style={styles.statCard}>
            <Icon name="explore" size={22} color={colors.onBackground} />
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.onBackground }]}>500m</Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>GRID CELL MESH</Text>
            </View>
          </StandardCard>

          <TouchableOpacity
            style={styles.bannerWrapper}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('WomenSafety')}
          >
            <GradientView
              colors={['#2B101E', '#1B0B14']}
              style={[styles.bannerContainer, { borderColor: 'rgba(236,72,153,0.35)' }]}
            >
              <View style={[styles.bannerIconWrapper, { backgroundColor: 'rgba(236,72,153,0.15)', borderColor: 'rgba(236,72,153,0.4)' }]}>
                <Icon name="female" size={22} color="#EC4899" />
              </View>
              <View style={styles.bannerContent}>
                <Text style={[styles.bannerTitle, { color: '#F472B6' }]}>WOMEN SAFETY & PANIC HUB</Text>
                <Text style={[styles.bannerText, { color: '#FCE7F3' }]}>Siren panic alarm, 24/7 helplines & fake exit calls.</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#F472B6" />
            </GradientView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bannerWrapper}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('OfflineEmergency')}
          >
            <GradientView
              colors={['#1E2638', '#161C2E']}
              style={[styles.bannerContainer, { borderColor: colors.outline }]}
            >
              <View style={[styles.bannerIconWrapper, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
                <Icon name="wifi-off" size={22} color={colors.primary} />
              </View>
              <View style={styles.bannerContent}>
                <Text style={[styles.bannerTitle, { color: '#FFFFFF' }]}>NO NETWORK & OFFLINE HUB</Text>
                <Text style={[styles.bannerText, { color: '#94A3B8' }]}>Cellular voice dialers, offline SMS & queue status.</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#94A3B8" />
            </GradientView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bannerWrapper}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Governance')}
          >
            <GradientView
              colors={['#1E2638', '#161C2E']}
              style={[styles.bannerContainer, { borderColor: colors.outline }]}
            >
              <View style={[styles.bannerIconWrapper, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
                <Icon name="gavel" size={22} color={colors.onBackground} />
              </View>
              <View style={styles.bannerContent}>
                <Text style={[styles.bannerTitle, { color: '#FFFFFF' }]}>ZERO-TRUST GOVERNANCE</Text>
                <Text style={[styles.bannerText, { color: '#94A3B8' }]}>Inspect cryptography & privacy guarantees.</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#94A3B8" />
            </GradientView>
          </TouchableOpacity>
        </Animated.View>

        {/* CTA to Create Custom Request */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateRequest')}
          >
            <GradientView
              colors={['#EF4444', '#991B1B']}
              style={styles.createRequestCTA}
            >
              <View style={styles.createRequestContent}>
                <Text style={styles.createRequestCTAText}>CUSTOMIZE YOUR QUICK SOS</Text>
                <Text style={styles.createRequestCTASub}>Pre-configure custom alerts for faster response.</Text>
              </View>
              <Icon name="arrow-forward" size={18} color="#000000" />
            </GradientView>
          </TouchableOpacity>
        </Animated.View>
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
  },
  header: {
    height: 56,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  roleContainer: {
    padding: 4,
    borderRadius: 14,
    flexDirection: 'row',
    borderWidth: 1,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  roleButtonActive: {
    backgroundColor: actionColors.actionRed,
  },
  roleText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  roleTextActive: {
    color: actionColors.actionButtonText,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    color: '#EF4444',
    letterSpacing: 0.8,
  },
  locationValue: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 13,
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
    fontFamily: 'WorkSans-Bold',
    fontSize: 14,
    color: '#EF4444',
  },
  liveBadgeWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    backgroundColor: actionColors.actionRed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  liveText: {
    color: actionColors.actionButtonText,
    fontSize: 10,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  timerLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  timerText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    marginTop: 2,
  },
  timerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: actionColors.actionRed,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cardButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  cardButtonText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
  },
  connectionHelpContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  connectionHelpIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  connectionHelpTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  connectionHelpText: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  connectionHelpButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  connectionHelpButtonText: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  emptyStateContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 18,
  },
  emptyStateSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  actionPill: {
    backgroundColor: actionColors.actionRed,
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
    color: actionColors.actionButtonText,
    fontFamily: 'SpaceGrotesk-Bold',
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
    fontFamily: 'WorkSans-Bold',
    fontSize: 15,
  },
  statLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  bannerWrapper: {
    width: '100%',
  },
  bannerContainer: {
    width: '100%',
    borderWidth: 1,
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
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  bannerText: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 12,
    marginTop: 1,
  },
  createRequestCTA: {
    backgroundColor: actionColors.actionRed,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  createRequestCTAText: {
    color: actionColors.actionButtonText,
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  createRequestContent: {
    flex: 1,
    gap: 2,
  },
  createRequestCTASub: {
    color: 'rgba(0,0,0,0.7)',
    fontFamily: 'WorkSans-Regular',
    fontSize: 11,
  },
  setupBanner: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  setupBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  setupBannerTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 14,
  },
  setupBannerText: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
  },
  setupBannerBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  setupBannerBtnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

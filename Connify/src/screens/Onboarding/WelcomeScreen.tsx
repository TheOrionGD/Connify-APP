import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  Platform,
  PermissionsAndroid,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { locationService } from '../../services/locationService';
import { profileApi } from '../../services/api/profileApi';
import { useRewardStore } from '../../stores/rewardStore';
import { DialogueModal } from '../../components/common/DialogueModal';
import { API_BASE_URL } from '@env';

const LOGO_IMAGE = require('../../../assets/logo_converted.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

const ONBOARDING_CARDS = [
  // --- Section 1: Core Platform & P2P Mesh Features ---
  { id: 'welcome_network', key: '1', title: 'Welcome to Connify' },
  { id: 'sos_protocol', key: '2', title: 'Decentralized Peer Dispatch' },
  { id: 'connection_levels', key: '3', title: '5-Level Engagement Scale' },
  { id: 'live_radar', key: '4', title: 'Real-Time Proximity Radar' },
  { id: 'qr_verification', key: '5', title: 'Cryptographic QR Handshake' },
  { id: 'spatial_grid', key: '6', title: 'Blinded Geolocation Spatial Grid' },
  { id: 'community_mesh', key: '7', title: 'Community P2P Mesh Relaying' },
  { id: 'node_health', key: '8', title: 'Network Node & Health' },
  { id: 'privacy_guarantee', key: '9', title: 'Zero-Knowledge Privacy Policy' },

  // --- Section 2: Stranger Discovery Categories ---
  { id: 'stranger_intro', key: '10', title: 'Connecting Strangers Nearby' },
  { id: 'social_coffee_cat', key: '11', title: 'Coffee & Casual Social Chat' },
  { id: 'study_skills_cat', key: '12', title: 'Study Buddy & Skill Exchange' },
  { id: 'sports_fitness_cat', key: '13', title: 'Sports & Workout Companions' },
  { id: 'travel_culture_cat', key: '14', title: 'Travel & Language Practice' },
  { id: 'gaming_hobbies_cat', key: '15', title: 'Gaming, Anime & Hobby Pairs' },
  { id: 'coworking_tech_cat', key: '16', title: 'Co-Working & Tech Collaboration' },
  { id: 'events_arts_cat', key: '17', title: 'Concerts, Music Jams & Arts' },
  { id: 'neighborhood_pet_cat', key: '18', title: 'Local Advice & Pet Meetups' },
  { id: 'foodie_carpool_cat', key: '19', title: 'Foodie Outings & Shared Commute' },

  // --- Section 3: Profile Setup, Permissions & Get Started ---
  { id: 'profile_interests', key: '20', title: 'Setup Connection Profile' },
  { id: 'perm_suite', key: '21', title: 'Permissions & Device Sensors' },
  { id: 'auth_get_started', key: '22', title: 'Join the Connify Network' },
];

export default function WelcomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Stores
  const {
    isAuthenticated,
    userProfile,
    signInWithGoogle,
    signInAnonymously,
    ensureDeviceId,
  } = useAuthStore();
  const { fetchLocation } = useLocationStore();

  // Permission states
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);

  // Backend Live Status & Latency
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'error'>('checking');
  const [backendLatency, setBackendLatency] = useState<number | null>(null);
  const [nodeId, setNodeId] = useState<string>('NODE-INITIALIZING');

  // Primary Guardian Setup Form State
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Guardian');
  const [guardianSaved, setGuardianSaved] = useState(false);

  // Secondary Guardian & Medical Profile Form State
  const [secondaryName, setSecondaryName] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [medicalNotesText, setMedicalNotesText] = useState('');
  const [medicalSaved, setMedicalSaved] = useState(false);

  // Custom Alert / Dialog State
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    iconName?: string;
    iconColor?: string;
    confirmText?: string;
    onConfirm?: () => void;
    cancelText?: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  // Auth state
  const [authLoading, setAuthLoading] = useState(false);
  const isMountedRef = useRef(true);

  // Check backend health asynchronously
  const checkBackendHealth = useCallback(async () => {
    if (!isMountedRef.current) return;
    setBackendStatus('checking');
    const startTime = Date.now();
    try {
      const backendUrl = API_BASE_URL || 'https://connify-backend.onrender.com';
      const fetchUrl = backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(fetchUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!isMountedRef.current) return;
      const latency = Date.now() - startTime;
      setBackendLatency(latency);
      if (res.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('error');
      }
    } catch (e) {
      if (!isMountedRef.current) return;
      setBackendStatus('error');
      setBackendLatency(null);
    }
  }, []);

  // Initial setup & prefill
  useEffect(() => {
    isMountedRef.current = true;
    checkBackendHealth();

    // Derive deterministic hardware identity
    ensureDeviceId().then((id) => {
      if (id && isMountedRef.current) {
        setNodeId(`NODE-${Platform.OS.toUpperCase()}-${id.substring(0, 10).toUpperCase()}`);
      }
    }).catch(() => {
      if (isMountedRef.current) {
        setNodeId(`NODE-${Platform.OS.toUpperCase()}-ED25519-READY`);
      }
    });

    // Check existing permissions on mount
    if (Platform.OS === 'android') {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(setLocationGranted);
      if (Platform.Version >= 33) {
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS).then(setNotificationsGranted);
      }
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA).then(setCameraGranted);
    }

    // Load existing primary guardian data
    AsyncStorage.getItem('@connify_guardian_data').then((data) => {
      if (data && isMountedRef.current) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.name) setGuardianName(parsed.name);
          if (parsed.phone) setGuardianPhone(parsed.phone);
          if (parsed.relationship) setGuardianRelation(parsed.relationship);
          setGuardianSaved(true);
        } catch (err) {
          // Ignore
        }
      }
    });

    // Load existing medical & secondary data
    AsyncStorage.getItem('@connify_medical_data').then((data) => {
      if (data && isMountedRef.current) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.secondaryName) setSecondaryName(parsed.secondaryName);
          if (parsed.secondaryPhone) setSecondaryPhone(parsed.secondaryPhone);
          if (parsed.bloodType) setBloodType(parsed.bloodType);
          if (parsed.medicalNotesText) setMedicalNotesText(parsed.medicalNotesText);
          setMedicalSaved(true);
        } catch (err) {
          // Ignore
        }
      }
    });

    if (isAuthenticated) {
      navigation.replace('Main');
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [isAuthenticated, navigation, checkBackendHealth, ensureDeviceId]);

  // Save Connection Profile Handler
  const handleSaveGuardian = async (suppressAlert = false): Promise<boolean> => {
    if (!guardianName.trim()) {
      if (!suppressAlert) {
        showCustomAlert(
          'Display Name Required',
          'Please enter your Display Name to personalize your connection profile.',
          'account-circle',
          '#2563EB'
        );
      }
      return false;
    }

    const guardianPayload = {
      name: guardianName.trim(),
      phone: guardianPhone.trim(),
      relationship: guardianRelation.trim() || 'Member',
    };

    try {
      await AsyncStorage.setItem('@connify_guardian_data', JSON.stringify(guardianPayload));
      setGuardianSaved(true);
      useRewardStore.getState().unlockBadge('GUARDIAN_SETUP');

      if (userProfile) {
        let existingNotes = {};
        try {
          if (userProfile.medicalNotes) existingNotes = JSON.parse(userProfile.medicalNotes);
        } catch (e) {
          // ignore
        }
        await profileApi.upsertProfile({
          firstName: guardianName.trim() || userProfile.firstName || 'Safety',
          lastName: userProfile.lastName || 'User',
          phone: userProfile.phone || '',
          medicalNotes: JSON.stringify({ ...existingNotes, guardian: guardianPayload }),
        });
      }

      if (!suppressAlert) {
        showCustomAlert(
          'Profile Saved & Ready',
          `Your connection profile (${guardianPayload.name}) has been saved and will be shared with peers you connect with.`,
          'verified-user',
          '#10B981'
        );
      }
      return true;
    } catch (err) {
      if (!suppressAlert) {
        showCustomAlert('Error Saving Guardian', 'Failed to store guardian details locally.', 'error', '#EF4444');
      }
      return false;
    }
  };

  // Save Secondary Guardian & Medical Profile Handler
  const handleSaveMedical = async () => {
    if (!bloodType.trim() && !secondaryPhone.trim() && !medicalNotesText.trim()) {
      showCustomAlert(
        'Empty Medical Profile',
        'Please enter at least a blood group, emergency note, or secondary phone number.',
        'medical-services',
        '#DC2626'
      );
      return;
    }

    const medicalPayload = {
      secondaryName: secondaryName.trim(),
      secondaryPhone: secondaryPhone.trim(),
      bloodType: bloodType.trim(),
      medicalNotesText: medicalNotesText.trim(),
    };

    try {
      await AsyncStorage.setItem('@connify_medical_data', JSON.stringify(medicalPayload));
      setMedicalSaved(true);
      showCustomAlert(
        'Medical Profile Stored',
        'Your medical notes and backup contact have been encrypted and saved to your device.',
        'check-circle',
        '#10B981'
      );
    } catch (err) {
      showCustomAlert('Storage Error', 'Failed to save medical details locally.', 'error', '#EF4444');
    }
  };

  const showCustomAlert = (
    title: string,
    message: string,
    iconName = 'info',
    iconColor = '#DC2626',
    confirmText = 'OK',
    onConfirm?: () => void
  ) => {
    setDialogConfig({
      visible: true,
      title,
      message,
      iconName,
      iconColor,
      confirmText,
      onConfirm: () => {
        setDialogConfig((prev) => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
    });
  };

  // Permission Handlers
  const handleLocationToggle = async (value: boolean) => {
    if (value) {
      const granted = await locationService.requestLocationPermission();
      setLocationGranted(granted);
      if (granted) {
        await fetchLocation();
        showCustomAlert(
          'Precise Location Enabled',
          'Your device can now accurately determine blinded grid coordinates for emergency responder matching.',
          'my-location',
          '#10B981'
        );
      } else {
        showCustomAlert(
          'Permission Denied',
          'Location access is necessary to route responders during emergencies. You can enable this later in device settings.',
          'location-off',
          '#EF4444'
        );
      }
    } else {
      setLocationGranted(false);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Critical Alerts Permission',
            message: 'Connify requires notification access to send high-priority safety alerts.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setNotificationsGranted(isGranted);
        if (isGranted) {
          showCustomAlert(
            'Critical Alerts Enabled',
            'High-priority emergency alerts will now reach your device immediately.',
            'notifications-active',
            '#10B981'
          );
        }
      } else {
        setNotificationsGranted(true);
      }
    } else {
      setNotificationsGranted(false);
    }
  };

  const handleCameraToggle = async (value: boolean) => {
    if (value) {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Connify needs access to camera for scanning responder verification QR codes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setCameraGranted(isGranted);
        if (isGranted) {
          showCustomAlert(
            'Camera Access Enabled',
            'You are ready to scan and execute mutual QR proximity handshakes.',
            'qr-code-scanner',
            '#10B981'
          );
        }
      } else {
        setCameraGranted(true);
      }
    } else {
      setCameraGranted(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      if (guardianName.trim()) {
        await handleSaveGuardian(true);
      }
      if (bloodType.trim() || secondaryPhone.trim() || medicalNotesText.trim()) {
        await handleSaveMedical();
      }
      await signInWithGoogle();
      const state = useAuthStore.getState();
      if (state.error) {
        showCustomAlert('Google Sign-In Error', state.error, 'error-outline', '#EF4444');
        return;
      }
      if (state.isAuthenticated) {
        navigation.replace('GoogleAuthSuccess');
      }
    } catch (err: any) {
      showCustomAlert('Sign-In Error', err.message || 'Google Authentication failed. Please try again.', 'error', '#EF4444');
    } finally {
      setAuthLoading(false);
    }
  };

  // Guest Sign-In Handler
  const handleGuestSignIn = async () => {
    setAuthLoading(true);
    try {
      if (guardianName.trim()) {
        await handleSaveGuardian(true);
      }
      if (bloodType.trim() || secondaryPhone.trim() || medicalNotesText.trim()) {
        await handleSaveMedical();
      }
      await signInAnonymously();
      navigation.replace('Main');
    } catch (err: any) {
      navigation.replace('Main');
    } finally {
      setAuthLoading(false);
    }
  };

  const scrollToIndex = async (index: number) => {
    // 1. Enforce Profile Details Gate on Profile Setup Card (profile_interests)
    const profileCardIndex = ONBOARDING_CARDS.findIndex((c) => c.id === 'profile_interests');
    if (profileCardIndex !== -1 && activeIndex === profileCardIndex && index > profileCardIndex && !guardianName.trim()) {
      showCustomAlert(
        'Display Name Required',
        'Please enter your display name to set up your connection profile before proceeding.',
        'account-circle',
        '#2563EB'
      );
      return;
    }

    if (index >= 0 && index < ONBOARDING_CARDS.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setActiveIndex(index);
    }
  };

  const onScrollMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < ONBOARDING_CARDS.length) {
      setActiveIndex(index);
    }
  };

  // Render individual Swipe Card
  const renderCardItem = ({ item, index }: { item: typeof ONBOARDING_CARDS[0]; index: number }) => {
    return (
      <View style={styles.cardSlideWrapper}>
        <ScrollView
          style={styles.cardScrollView}
          contentContainerStyle={styles.cardScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.skeuomorphicCard}>
            {/* CARD 1: Welcome to Connify */}
            {item.id === 'welcome_network' && (
              <View style={styles.cardContent}>
                <View style={styles.heroBadge}>
                  <Image source={LOGO_IMAGE} style={{ width: 44, height: 44, resizeMode: 'contain' }} />
                </View>
                <Text style={styles.cardTitle}>Welcome to Connify</Text>
                <Text style={styles.cardSubtitle}>
                  The next-generation P2P platform for local stranger connections and peer assistance. Designed for authentic real-world interactions, total privacy, and offline mesh resilience.
                </Text>

                <View style={[styles.statusRowBox, { borderColor: backendStatus === 'online' ? '#10B981' : '#FAE4E4' }]}>
                  <Icon
                    name={backendStatus === 'online' ? 'cloud-done' : backendStatus === 'checking' ? 'cloud-sync' : 'wifi-off'}
                    size={22}
                    color={backendStatus === 'online' ? '#10B981' : '#F59E0B'}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.statusBoxTitle}>
                      CLUSTER NODE: {backendStatus === 'online' ? 'ACTIVE & READY' : backendStatus === 'checking' ? 'WARMING UP...' : 'CONNECTING...'}
                    </Text>
                    <Text style={styles.statusBoxSub}>
                      {backendLatency ? `Network Ping: ${backendLatency}ms` : 'Asynchronous cluster heartbeat active'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={checkBackendHealth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon name="refresh" size={18} color="#2563EB" />
                  </TouchableOpacity>
                </View>

                <View style={styles.keyDisplayBox}>
                  <Text style={styles.keyDisplayLabel}>YOUR PEER NODE IDENTITY</Text>
                  <Text style={styles.keyDisplayText} numberOfLines={1}>{nodeId}</Text>
                </View>
              </View>
            )}
            {/* CARD 2: Decentralized Peer Dispatch */}
            {item.id === 'sos_protocol' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#2563EB' }]}>
                  <Icon name="hub" size={40} color="#2563EB" />
                </View>
                <Text style={styles.cardTitle}>Decentralized Peer Dispatch</Text>
                <Text style={styles.cardSubtitle}>
                  Connect directly with nearby verified peers and helpers without central tracking or data mining.
                </Text>
                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="bolt" size={20} color="#2563EB" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Sub-Second Match Dispatch</Text>
                      <Text style={styles.pillSub}>Instant notification to nearby helper nodes in real time.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="lock-clock" size={20} color="#10B981" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Ephemeral Session Tokens</Text>
                      <Text style={styles.pillSub}>Location tokens auto-purged upon request completion.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {item.id === 'connection_levels' && (
              /* CARD 3: 5-Level Engagement Scale */
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#8B5CF6' }]}>
                  <Icon name="layers" size={40} color="#8B5CF6" />
                </View>
                <Text style={styles.cardTitle}>5-Level Engagement Scale</Text>
                <Text style={styles.cardSubtitle}>
                  Choose your interaction comfort zone—from lightweight text Q&A to public meetups and deep local collaboration.
                </Text>

                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="chat" size={18} color="#8B5CF6" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Level 1: Quick Q&A / Advice</Text>
                      <Text style={styles.pillSub}>Asynchronous text-based local queries & tips.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="forum" size={18} color="#2563EB" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Level 2: Virtual Pre-Meetup Alignment</Text>
                      <Text style={styles.pillSub}>Direct in-app messaging to align plans and goals.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="local-cafe" size={18} color="#10B981" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Level 3: Casual 30-Min Public Meetup</Text>
                      <Text style={styles.pillSub}>Low-stakes coffee or public park conversation.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="groups" size={18} color="#F59E0B" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Level 4: Regular Activity Duo / Pod</Text>
                      <Text style={styles.pillSub}>Recurring gym spotters, study partners, or run groups.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="handshake" size={18} color="#EC4899" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Level 5: Deep Collaboration & Projects</Text>
                      <Text style={styles.pillSub}>Hackathons, co-working ventures, and skill workshops.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {item.id === 'live_radar' && (
              /* CARD 4: Real-Time Proximity Radar */
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#EF4444' }]}>
                  <Icon name="radar" size={40} color="#EF4444" />
                </View>
                <Text style={styles.cardTitle}>Real-Time Proximity Radar</Text>
                <Text style={styles.cardSubtitle}>
                  Discover nearby peers and active connection requests within 1–5 km around your location. Dynamic compass telemetry calculates distance and relative direction.
                </Text>
                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="speed" size={20} color="#EF4444" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Proximity Distance Matrix</Text>
                      <Text style={styles.pillSub}>Displays distance to nearby peers in real time.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="explore" size={20} color="#10B981" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Interactive Compass Ring</Text>
                      <Text style={styles.pillSub}>Visual compass ring for orienting local meetups.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {item.id === 'qr_verification' && (
              /* CARD 5: Safe Mutual QR Verification */
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#10B981' }]}>
                  <Icon name="qr-code-scanner" size={40} color="#10B981" />
                </View>
                <Text style={styles.cardTitle}>Safe Mutual QR Verification</Text>
                <Text style={styles.cardSubtitle}>
                  Zero-risk stranger meetups. When meeting in person, both parties scan a dynamic QR code challenge on screen to verify identities cryptographically.
                </Text>

                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="verified-user" size={20} color="#10B981" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Dual Handshake Validation</Text>
                      <Text style={styles.pillSub}>Confirms counterparty identity offline via secure cryptographic nonce.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="phonelink-lock" size={20} color="#2563EB" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Zero Identity Leak</Text>
                      <Text style={styles.pillSub}>Phone numbers and private contact details remain protected.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {item.id === 'spatial_grid' && (
              /* CARD 6: Blinded Geolocation Privacy */
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#2563EB' }]}>
                  <Icon name="grid-view" size={40} color="#2563EB" />
                </View>
                <Text style={styles.cardTitle}>Blinded Geolocation Privacy</Text>
                <Text style={styles.cardSubtitle}>
                  Your exact GPS position is converted into regional grid tokens to keep exact user locations private until mutual connection consent.
                </Text>

                <View style={styles.gridDemoBox}>
                  <View style={styles.gridHeaderRow}>
                    <Icon name="grid-view" size={16} color="#2563EB" />
                    <Text style={styles.gridHeaderTitle}>BLINDED GRID-CELL DISCOVERY</Text>
                  </View>
                  <View style={styles.gridRow}>
                    <View style={styles.gridCell}><Text style={styles.gridText}>CELL 3A</Text></View>
                    <View style={[styles.gridCell, styles.gridCellActive]}><Text style={styles.gridTextActive}>TARGET GRID</Text></View>
                    <View style={styles.gridCell}><Text style={styles.gridText}>CELL 3C</Text></View>
                  </View>
                  <Text style={styles.gridSub}>Peers receive coarse grid cells until closer proximity handshake.</Text>
                </View>
              </View>
            )}

            {item.id === 'community_mesh' && (
              /* CARD 7: Community P2P Social Mesh */
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#8B5CF6' }]}>
                  <Icon name="hub" size={40} color="#8B5CF6" />
                </View>
                <Text style={styles.cardTitle}>Community P2P Social Mesh</Text>
                <Text style={styles.cardSubtitle}>
                  Connify creates a local peer-to-peer mesh using Bluetooth & Wi-Fi Direct to pass local activity invites and stranger connection requests nearby.
                </Text>

                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="cell-tower" size={20} color="#8B5CF6" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Hop-by-Hop Relaying</Text>
                      <Text style={styles.pillSub}>Broadcast activity invites across surrounding devices.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="people-alt" size={20} color="#10B981" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Hyperlocal Discovery Radius</Text>
                      <Text style={styles.pillSub}>Connect with strangers within your immediate neighborhood.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {item.id === 'node_health' && (
              /* CARD 12: Network Node & Health */
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#0284C7' }]}>
                  <Icon name="dns" size={40} color="#0284C7" />
                </View>
                <Text style={styles.cardTitle}>Network Node & Health</Text>
                <Text style={styles.cardSubtitle}>
                  Real-time status of your P2P connection node, relay latencies, and active server cluster synchronization.
                </Text>

                <View style={[styles.statusRowBox, { borderColor: backendStatus === 'online' ? '#10B981' : '#FAE4E4' }]}>
                  <Icon
                    name={backendStatus === 'online' ? 'cloud-done' : backendStatus === 'checking' ? 'cloud-sync' : 'wifi-off'}
                    size={22}
                    color={backendStatus === 'online' ? '#10B981' : '#F59E0B'}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.statusBoxTitle}>
                      P2P CLUSTER: {backendStatus === 'online' ? 'ONLINE & SYNCED' : backendStatus === 'checking' ? 'TESTING CONNECTIVITY...' : 'OFFLINE'}
                    </Text>
                    <Text style={styles.statusBoxSub}>
                      {backendLatency ? `Roundtrip latency: ${backendLatency}ms` : 'Press refresh to test connection latency'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={checkBackendHealth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon name="refresh" size={18} color="#2563EB" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {item.id === 'privacy_guarantee' && (
              /* CARD 20: Zero-Knowledge Privacy Policy */
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#10B981' }]}>
                  <Icon name="verified" size={40} color="#10B981" />
                </View>
                <Text style={styles.cardTitle}>Zero-Knowledge Privacy Policy</Text>
                <Text style={styles.cardSubtitle}>
                  We guarantee absolute privacy. Connify never sells your location data, stores history logs, or tracks user movements.
                </Text>

                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="security" size={20} color="#10B981" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Hardware Key Encryption</Text>
                      <Text style={styles.pillSub}>Keys stay securely inside device Secure Enclave.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="auto-delete" size={20} color="#DC2626" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Automatic Ephemeral Deletion</Text>
                      <Text style={styles.pillSub}>Connection data is purged upon breakup/completion.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* CARD 21: Connecting Strangers Nearby */}
            {item.id === 'stranger_intro' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#2563EB' }]}>
                  <Icon name="groups" size={40} color="#2563EB" />
                </View>
                <Text style={styles.cardTitle}>Connecting Strangers Nearby</Text>
                <Text style={styles.cardSubtitle}>
                  Connify brings people together! Meet nearby strangers based on shared interests, local activities, skill swaps, and real-world conversations in a safe, privacy-first network.
                </Text>
                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="people-alt" size={20} color="#2563EB" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Proximity Stranger Discovery</Text>
                      <Text style={styles.pillSub}>Discover like-minded peers within 1–5 km around you.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* CARD 22: Coffee & Casual Social Chat */}
            {item.id === 'social_coffee_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#2563EB' }]}>
                  <Icon name="coffee" size={40} color="#2563EB" />
                </View>
                <Text style={styles.cardTitle}>Coffee & Casual Social Chat</Text>
                <Text style={styles.cardSubtitle}>
                  Meet up for casual coffee, morning tea, or friendly conversation at a nearby neighborhood cafe.
                </Text>
                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="local-cafe" size={20} color="#2563EB" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>30-Min Cafe Meetups</Text>
                      <Text style={styles.pillSub}>Low-pressure, public spot coffee chats with local strangers.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* CARD 23: Study Buddy & Skill Exchange */}
            {item.id === 'study_skills_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#10B981' }]}>
                  <Icon name="school" size={40} color="#10B981" />
                </View>
                <Text style={styles.cardTitle}>Study Buddy & Skill Exchange</Text>
                <Text style={styles.cardSubtitle}>
                  Pair up with student peers for library co-studying, exam prep, language practice, or mutual skill mentoring.
                </Text>
                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="psychology" size={20} color="#10B981" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Mutual Mentorship</Text>
                      <Text style={styles.pillSub}>Exchange skills like coding, guitar, design, or languages.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* CARD 13: Sports & Workout Companions */}
            {item.id === 'sports_fitness_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#F59E0B' }]}>
                  <Icon name="fitness-center" size={40} color="#F59E0B" />
                </View>
                <Text style={styles.cardTitle}>Sports & Workout Companions</Text>
                <Text style={styles.cardSubtitle}>
                  Find gym spotters, jogging buddies, tennis/badminton partners, yoga pairs, or hiking companions in your area.
                </Text>
                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="directions-run" size={20} color="#F59E0B" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Gym Spotters & Running Duos</Text>
                      <Text style={styles.pillSub}>Stay accountable with nearby fitness enthusiasts.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="sports-tennis" size={20} color="#10B981" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Local Court Matches & Hiking</Text>
                      <Text style={styles.pillSub}>Pickleball, badminton, outdoor trails, and yoga.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* CARD 14: Travel & Language Practice */}
            {item.id === 'travel_culture_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#6366F1' }]}>
                  <Icon name="explore" size={40} color="#6366F1" />
                </View>
                <Text style={styles.cardTitle}>Travel & Language Practice</Text>
                <Text style={styles.cardSubtitle}>
                  Explore city walking tours, heritage spots, road trips, and practice conversational languages with native speakers.
                </Text>
                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="translate" size={20} color="#6366F1" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Conversational Language Exchange</Text>
                      <Text style={styles.pillSub}>Native speakers practicing casually over tea or coffee.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="map" size={20} color="#2563EB" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>City Photowalks & Heritage Trips</Text>
                      <Text style={styles.pillSub}>Discover hidden neighborhood gems with local guides.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* CARD 15: Gaming, Anime & Hobby Pairs */}
            {item.id === 'gaming_hobbies_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#EC4899' }]}>
                  <Icon name="sports-esports" size={40} color="#EC4899" />
                </View>
                <Text style={styles.cardTitle}>Gaming, Anime & Hobby Pairs</Text>
                <Text style={styles.cardSubtitle}>
                  Connect for co-op video games, board game cafe meetups, anime watch parties, and tabletop RPG campaigns.
                </Text>
                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="videogame-asset" size={20} color="#EC4899" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Multiplayer Co-Op & Tournaments</Text>
                      <Text style={styles.pillSub}>Squad up for PC, console, or mobile gaming sessions.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="casino" size={20} color="#8B5CF6" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Board Game Cafes & Anime Watch</Text>
                      <Text style={styles.pillSub}>Strategy tabletop games, D&D campaigns, and fandom.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* CARD 16: Co-Working & Tech Collaboration */}
            {item.id === 'coworking_tech_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#0284C7' }]}>
                  <Icon name="work" size={40} color="#0284C7" />
                </View>
                <Text style={styles.cardTitle}>Co-Working & Tech Collaboration</Text>
                <Text style={styles.cardSubtitle}>
                  Freelance cafe co-working, pair programming side-projects, hackathons, and professional networking.
                </Text>
                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="laptop-mac" size={20} color="#0284C7" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Cafe Co-Working Sprints</Text>
                      <Text style={styles.pillSub}>Focus alongside remote builders, writers, and devs.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="code" size={20} color="#10B981" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Side-Project Brainstorms & Hackathons</Text>
                      <Text style={styles.pillSub}>Find co-founders, designers, and engineering peers.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* CARD 17: Concerts, Music Jams & Arts */}
            {item.id === 'events_arts_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#8B5CF6' }]}>
                  <Icon name="music-note" size={40} color="#8B5CF6" />
                </View>
                <Text style={styles.cardTitle}>Concerts, Music Jams & Arts</Text>
                <Text style={styles.cardSubtitle}>
                  Find event buddies for music gigs, theater, acoustic jam sessions, pottery workshops, and art gallery walks.
                </Text>
                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="album" size={20} color="#8B5CF6" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Live Gigs & Festival Companions</Text>
                      <Text style={styles.pillSub}>Never miss a concert or indie show just because you're solo.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="palette" size={20} color="#F59E0B" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Art Galleries & Creative Jams</Text>
                      <Text style={styles.pillSub}>Weekend museum visits, sketch walks, and acoustic sessions.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* CARD 18: Local Advice & Pet Meetups */}
            {item.id === 'neighborhood_pet_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#10B981' }]}>
                  <Icon name="pets" size={40} color="#10B981" />
                </View>
                <Text style={styles.cardTitle}>Local Advice & Pet Meetups</Text>
                <Text style={styles.cardSubtitle}>
                  Dog park playdates, pet walking, borrowing household tools, and neighborhood newcomer orientation.
                </Text>
                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="pets" size={20} color="#10B981" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Dog Park Playdates & Walking</Text>
                      <Text style={styles.pillSub}>Socialize your pets with nearby furry friends safely.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="home-work" size={20} color="#2563EB" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Hyperlocal Tips & Mutual Aid</Text>
                      <Text style={styles.pillSub}>Recommendations for doctors, services, and neighborhood advice.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* CARD 19: Foodie Outings & Shared Commute */}
            {item.id === 'foodie_carpool_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#F59E0B' }]}>
                  <Icon name="restaurant" size={40} color="#F59E0B" />
                </View>
                <Text style={styles.cardTitle}>Foodie Outings & Shared Commute</Text>
                <Text style={styles.cardSubtitle}>
                  Group food crawls, trying new local restaurants, weekend potlucks, and daily workplace carpools.
                </Text>
                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="dinner-dining" size={20} color="#F59E0B" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Street Food Crawls & Dining Pods</Text>
                      <Text style={styles.pillSub}>Explore local eateries and sample menus family-style.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="directions-car" size={20} color="#10B981" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Community Carpool & Rides</Text>
                      <Text style={styles.pillSub}>Split commute costs and reduce emissions with trusted peers.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* CARD 20: Setup Connection Profile */}
            {item.id === 'profile_interests' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: guardianSaved ? '#10B981' : '#2563EB' }]}>
                  <Icon name="account-circle" size={40} color={guardianSaved ? '#10B981' : '#2563EB'} />
                </View>
                <Text style={styles.cardTitle}>Setup Connection Profile</Text>
                <Text style={styles.cardSubtitle}>
                  Personalize your stranger connection profile. Set your display name, primary interest tags, and preferred bio or handle.
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Your Display Name"
                    placeholderTextColor="#64748B"
                    value={guardianName}
                    onChangeText={(val) => {
                      setGuardianName(val);
                      setGuardianSaved(false);
                    }}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Primary Interest (e.g. Coffee, Coding, Jogging)"
                    placeholderTextColor="#64748B"
                    value={guardianPhone}
                    onChangeText={(val) => {
                      setGuardianPhone(val);
                      setGuardianSaved(false);
                    }}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Bio / Handle (e.g. @alex_coffee)"
                    placeholderTextColor="#64748B"
                    value={guardianRelation}
                    onChangeText={(val) => {
                      setGuardianRelation(val);
                      setGuardianSaved(false);
                    }}
                  />
                  <TouchableOpacity style={[styles.saveGuardianBtn, { backgroundColor: '#2563EB' }]} onPress={() => handleSaveGuardian(false)} activeOpacity={0.85}>
                    <Icon name={guardianSaved ? 'check-circle' : 'save'} size={18} color="#FFFFFF" />
                    <Text style={styles.saveGuardianBtnText}>
                      {guardianSaved ? 'PROFILE SAVED & READY' : 'SAVE CONNECTION PROFILE'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* CARD 21: Permissions & Device Sensors */}
            {item.id === 'perm_suite' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#2563EB' }]}>
                  <Icon name="settings-remote" size={40} color="#2563EB" />
                </View>
                <Text style={styles.cardTitle}>Permissions & Sensors</Text>
                <Text style={styles.cardSubtitle}>
                  Enable precise location for proximity radar, instant notifications for match alerts, and camera for QR scanning.
                </Text>
                <View style={styles.permissionToggleCard}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.toggleTitle}>Location & Radar Discovery</Text>
                    <Text style={styles.toggleSub}>{locationGranted ? 'ENABLED' : 'Tap switch to grant access'}</Text>
                  </View>
                  <Switch
                    value={locationGranted}
                    onValueChange={handleLocationToggle}
                    trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                <View style={styles.permissionToggleCard}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.toggleTitle}>Instant Match Notifications</Text>
                    <Text style={styles.toggleSub}>{notificationsGranted ? 'ENABLED' : 'Tap switch to grant access'}</Text>
                  </View>
                  <Switch
                    value={notificationsGranted}
                    onValueChange={handleNotificationToggle}
                    trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                <View style={styles.permissionToggleCard}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.toggleTitle}>Camera Scanner</Text>
                    <Text style={styles.toggleSub}>{cameraGranted ? 'ENABLED' : 'Tap switch to grant access'}</Text>
                  </View>
                  <Switch
                    value={cameraGranted}
                    onValueChange={handleCameraToggle}
                    trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            )}

            {item.id === 'auth_get_started' && (
              /* CARD 14: Join the Connify Network */
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#2563EB' }]}>
                  <Icon name="account-circle" size={40} color="#2563EB" />
                </View>
                <Text style={styles.cardTitle}>Join the Connify Network</Text>
                <Text style={styles.cardSubtitle}>
                  Sign in with Google to synchronize your encrypted connection profile across devices, or enter directly as a guest to explore nearby strangers.
                </Text>

                <TouchableOpacity
                  style={[styles.googleCtaButton, { backgroundColor: '#2563EB' }]}
                  onPress={handleGoogleSignIn}
                  disabled={authLoading}
                  activeOpacity={0.85}
                >
                  {authLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Icon name="g-mobiledata" size={30} color="#FFFFFF" />
                      <Text style={styles.googleCtaText}>SIGN IN WITH GOOGLE</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.guestCtaButton}
                  onPress={handleGuestSignIn}
                  disabled={authLoading}
                  activeOpacity={0.8}
                >
                  <Icon name="groups" size={16} color="#2563EB" />
                  <Text style={[styles.guestCtaText, { color: '#2563EB' }]}>EXPLORE AS GUEST</Text>
                </TouchableOpacity>

                <Text style={styles.policyFootnote}>
                  By connecting, you agree to Connify's{' '}
                  <Text
                    style={[styles.policyLink, { color: '#2563EB' }]}
                    onPress={() =>
                      showCustomAlert(
                        'Zero-Knowledge Connection Protocol',
                        'Connify operates on strict zero-knowledge principles. Location tokens are ephemeral and purged upon activity completion.',
                        'shield',
                        '#2563EB'
                      )
                    }
                  >
                    Connection Protocol
                  </Text>{' '}
                  and{' '}
                  <Text
                    style={styles.policyLink}
                    onPress={() =>
                      showCustomAlert(
                        'Data Protection Policy',
                        'Coordinates and identity keys remain hardware-bound and are never stored or logged on central servers.',
                        'lock',
                        '#10B981'
                      )
                    }
                  >
                    Data Protection Policy
                  </Text>
                  .
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header with Branding & Card Counter */}
      <View style={styles.header}>
        <View style={styles.branding}>
          <View style={styles.brandIconWrapper}>
            <Image source={LOGO_IMAGE} style={{ width: 22, height: 22, resizeMode: 'contain' }} />
          </View>
          <Text style={styles.brandName}>Connify</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              CARD {activeIndex + 1} OF {ONBOARDING_CARDS.length}
            </Text>
          </View>
          {activeIndex < ONBOARDING_CARDS.length - 1 && (
            <TouchableOpacity style={styles.skipBtn} onPress={() => scrollToIndex(ONBOARDING_CARDS.length - 1)}>
              <Text style={styles.skipBtnText}>SKIP TO END</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((activeIndex + 1) / ONBOARDING_CARDS.length) * 100}%` },
          ]}
        />
      </View>

      {/* Horizontal Swipe Card Viewport */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_CARDS}
        renderItem={renderCardItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollMomentumEnd}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
        style={styles.flatList}
      />

      {/* Sleek Bottom Pagination & Navigation Strip */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + 6 : 10,
            paddingTop: 8,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.navArrowBtn, activeIndex === 0 && styles.navArrowBtnDisabled]}
          onPress={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color={activeIndex === 0 ? '#CBD5E1' : '#2563EB'} />
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dotsStripContainer}>
          <View style={styles.dotsStrip}>
            {ONBOARDING_CARDS.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToIndex(index)}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <View
                  style={[
                    styles.paginationDot,
                    index === activeIndex && styles.paginationDotActive,
                    index < activeIndex && styles.paginationDotDone,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.navArrowBtn, activeIndex === ONBOARDING_CARDS.length - 1 && styles.navArrowBtnDisabled]}
          onPress={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === ONBOARDING_CARDS.length - 1}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-right" size={24} color={activeIndex === ONBOARDING_CARDS.length - 1 ? '#CBD5E1' : '#2563EB'} />
        </TouchableOpacity>
      </View>

      {/* Custom Alert / Dialog Modal */}
      <DialogueModal
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        iconName={dialogConfig.iconName}
        iconColor={dialogConfig.iconColor}
        confirmText={dialogConfig.confirmText}
        onConfirm={dialogConfig.onConfirm}
        onClose={() => setDialogConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  stepBadgeText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    color: '#475569',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  skipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  skipBtnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11.5,
    color: '#2563EB',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  flatList: {
    flex: 1,
  },
  cardSlideWrapper: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardScrollView: {
    width: '100%',
  },
  cardScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  skeuomorphicCard: {
    width: '100%',
    maxWidth: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
    gap: 12,
  },
  heroBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 13.5,
    lineHeight: 20,
    color: '#475569',
    textAlign: 'center',
  },
  pillList: {
    width: '100%',
    gap: 8,
    marginTop: 4,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  pillTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  pillSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  infoBanner: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  infoBannerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    color: '#2563EB',
    letterSpacing: 0.8,
  },
  infoBannerText: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
  },
  gridDemoBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gridHeaderTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10.5,
    color: '#2563EB',
    letterSpacing: 0.6,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 2,
  },
  gridCell: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  gridCellActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderColor: '#2563EB',
  },
  gridText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 9.5,
    color: '#64748B',
  },
  gridTextActive: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9.5,
    color: '#2563EB',
  },
  gridSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  statusRowBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    borderRadius: 14,
  },
  statusBoxTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    color: '#0F172A',
    letterSpacing: 0.4,
  },
  statusBoxSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2,
  },
  keyDisplayBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  keyDisplayLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9.5,
    color: '#2563EB',
    letterSpacing: 0.6,
  },
  keyDisplayText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 11,
    color: '#0F172A',
  },
  inputContainer: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#0F172A',
    fontFamily: 'WorkSans-Regular',
    fontSize: 13.5,
  },
  saveGuardianBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveGuardianBtnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  emergencyNumGrid: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 2,
  },
  emergencyNumCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    gap: 2,
  },
  emergencyNumValue: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    color: '#DC2626',
  },
  emergencyNumLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 8.5,
    color: '#64748B',
  },
  permissionToggleCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    borderRadius: 14,
  },
  toggleTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 13.5,
    color: '#0F172A',
  },
  toggleSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  googleCtaButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 13,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 6,
  },
  googleCtaText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  guestCtaButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 11,
  },
  guestCtaText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11.5,
    color: '#2563EB',
    letterSpacing: 0.6,
  },
  policyFootnote: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 11.5,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  policyLink: {
    fontFamily: 'WorkSans-Bold',
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  bottomBar: {
    minHeight: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  swipeHintText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 0.4,
    marginRight: 10,
  },
  dotsStripContainer: {
    alignItems: 'center',
    paddingRight: 8,
  },
  dotsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  paginationDotActive: {
    width: 18,
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  paginationDotDone: {
    backgroundColor: '#93C5FD',
  },
  navArrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowBtnDisabled: {
    backgroundColor: '#F1F5F9',
  },
});

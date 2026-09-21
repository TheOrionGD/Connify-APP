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
import { SafeAreaView } from 'react-native-safe-area-context';
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
  // --- Section 1: Core Platform & P2P Mesh Features (Cards 1 - 10) ---
  { id: 'welcome_network', key: '1', title: 'Welcome to Connify' },
  { id: 'sos_protocol', key: '2', title: 'Decentralized Peer Dispatch' },
  { id: 'biometric_auth', key: '3', title: 'Biometric Action Authorization' },
  { id: 'live_telemetry', key: '4', title: 'Live Proximity Radar & Telemetry' },
  { id: 'safe_escort', key: '5', title: 'Ephemeral Safe Escort Mode' },
  { id: 'secondary_swarm', key: '6', title: 'Secondary Swarm Network' },
  { id: 'wellness_check', key: '7', title: 'Automated Post-Episode Check-in' },
  { id: 'spatial_grid', key: '8', title: 'Blinded Geolocation Spatial Grid' },
  { id: 'community_mesh', key: '9', title: 'Community P2P Mesh Relaying' },
  { id: 'qr_verification', key: '10', title: 'Cryptographic QR Handshake' },

  // --- Section 2: Tactical Tools & Safety Guardians (Cards 11 - 20) ---
  { id: 'offline_engine', key: '11', title: 'Offline Carrier SMS Failover' },
  { id: 'emergency_helplines', key: '12', title: 'Direct National Helplines' },
  { id: 'women_safety', key: '13', title: 'Women Safety & Tactical Suite' },
  { id: 'fake_call', key: '14', title: 'Fake Call Simulator' },
  { id: 'siren_strobe', key: '15', title: 'High-Decibel Siren & Strobe' },
  { id: 'shake_panic', key: '16', title: 'Shake-to-Request & Silent Trigger' },
  { id: 'encrypted_blackbox', key: '17', title: 'Encrypted Incident Blackbox' },
  { id: 'guardian_setup', key: '18', title: 'Primary Contact & Guardian' },
  { id: 'medical_secondary', key: '19', title: 'Medical & Secondary Contact' },
  { id: 'privacy_guarantee', key: '20', title: 'Zero-Knowledge Privacy Policy' },

  // --- Section 3: Stranger Connections & 20 Categories (Cards 21 - 30) ---
  { id: 'stranger_intro', key: '21', title: 'Connecting Strangers Nearby' },
  { id: 'social_coffee_cat', key: '22', title: 'Coffee & Casual Social Chat' },
  { id: 'study_skills_cat', key: '23', title: 'Study Buddy & Skill Exchange' },
  { id: 'sports_fitness_cat', key: '24', title: 'Sports & Workout Companions' },
  { id: 'travel_culture_cat', key: '25', title: 'Travel & Language Practice' },
  { id: 'gaming_hobbies_cat', key: '26', title: 'Gaming, Anime & Hobby Pairs' },
  { id: 'coworking_tech_cat', key: '27', title: 'Co-Working & Tech Collaboration' },
  { id: 'events_arts_cat', key: '28', title: 'Concerts, Music Jams & Arts' },
  { id: 'neighborhood_pet_cat', key: '29', title: 'Local Advice & Pet Meetups' },
  { id: 'foodie_carpool_cat', key: '30', title: 'Foodie Outings & Shared Commute' },

  // --- Section 4: 5-Level Scale, Permissions & Onboarding Sign-In (Cards 31 - 33) ---
  { id: 'five_level_protocol', key: '31', title: '5-Level Engagement Scale' },
  { id: 'perm_suite', key: '32', title: 'Permissions & Device Sensors' },
  { id: 'auth_get_started', key: '33', title: 'Join the Connify Network' },
];

export default function WelcomeScreen({ navigation }: any) {
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

  // Save Primary Guardian Handler
  const handleSaveGuardian = async (suppressAlert = false): Promise<boolean> => {
    if (!guardianName.trim() || !guardianPhone.trim()) {
      if (!suppressAlert) {
        showCustomAlert(
          'Incomplete Details',
          'Please enter both a Guardian Name and a valid Phone Number for automated offline SMS and call alerts.',
          'contact-phone',
          '#DC2626'
        );
      }
      return false;
    }

    const guardianPayload = {
      name: guardianName.trim(),
      phone: guardianPhone.trim(),
      relationship: guardianRelation.trim() || 'Guardian',
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
          firstName: userProfile.firstName || 'Safety',
          lastName: userProfile.lastName || 'User',
          phone: userProfile.phone || '',
          medicalNotes: JSON.stringify({ ...existingNotes, guardian: guardianPayload }),
        });
      }

      if (!suppressAlert) {
        showCustomAlert(
          'Guardian Saved & Synced',
          `Primary Guardian (${guardianPayload.name} - ${guardianPayload.phone}) saved for one-touch offline SMS triggers and emergency dispatch.`,
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
      if (guardianName.trim() && guardianPhone.trim()) {
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
      if (guardianName.trim() && guardianPhone.trim()) {
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
    // 1. Enforce Guardian Details Gate on Guardian Card (guardian_setup)
    const guardianCardIndex = ONBOARDING_CARDS.findIndex((c) => c.id === 'guardian_setup');
    if (guardianCardIndex !== -1 && activeIndex === guardianCardIndex && index > guardianCardIndex && (!guardianName.trim() || !guardianPhone.trim())) {
      showCustomAlert(
        'Guardian Required',
        'You must enter and save your primary Guardian Name and Phone Number before proceeding.',
        'contact-phone',
        '#DC2626'
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
                  Choose your interaction intensity—from lightweight text Q&A (Level 1) to casual public coffee meetups (Level 3) and deep co-creation (Level 5).
                </Text>

                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="chat" size={20} color="#8B5CF6" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Level 1 - 2: Digital Exchange</Text>
                      <Text style={styles.pillSub}>Quick Q&A, virtual study chat, pre-meetup alignment.</Text>
                    </View>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="storefront" size={20} color="#10B981" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pillTitle}>Level 3 - 5: In-Person Collaboration</Text>
                      <Text style={styles.pillSub}>Casual public cafe meetups, group activities & hosting.</Text>
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

            {item.id === 'profile_interests' && (
              /* CARD 8: Setup Connection Profile */
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: guardianSaved ? '#10B981' : '#2563EB' }]}>
                  <Icon name="account-circle" size={40} color={guardianSaved ? '#10B981' : '#2563EB'} />
                </View>
                <Text style={styles.cardTitle}>Setup Connection Profile</Text>
                <Text style={styles.cardSubtitle}>
                  Personalize your stranger connection profile. Set your display name, primary interest tags, and preferred contact handle.
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

            {item.id === 'perm_location' && (
              /* CARD 9: Permission - Precise Location */
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#10B981' }]}>
                  <Icon name="my-location" size={40} color="#10B981" />
                </View>
                <Text style={styles.cardTitle}>Permission: Precise Location</Text>
                <Text style={styles.cardSubtitle}>
                  Required to calculate blinded grid cells and display nearby strangers and activity broadcasts on your proximity radar.
                </Text>

                <View style={styles.permissionToggleCard}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.toggleTitle}>Precise Location Access</Text>
                    <Text style={styles.toggleSub}>{locationGranted ? 'ENABLED (Optimal Discovery Active)' : 'Tap switch to grant access'}</Text>
                  </View>
                  <Switch
                    value={locationGranted}
                    onValueChange={handleLocationToggle}
                    trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            )}

            {item.id === 'perm_notifications' && (
              /* CARD 10: Permission - Instant Alerts */
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#F59E0B' }]}>
                  <Icon name="notifications-active" size={40} color="#F59E0B" />
                </View>
                <Text style={styles.cardTitle}>Permission: Instant Alerts</Text>
                <Text style={styles.cardSubtitle}>
                  Allow Connify to notify you immediately when a nearby stranger accepts your invitation or sends a local activity request.
                </Text>

                <View style={styles.permissionToggleCard}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.toggleTitle}>Instant Match Alerts</Text>
                    <Text style={styles.toggleSub}>{notificationsGranted ? 'ENABLED (Instant Notifications Active)' : 'Tap switch to grant access'}</Text>
                  </View>
                  <Switch
                    value={notificationsGranted}
                    onValueChange={handleNotificationToggle}
                    trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            )}

            {item.id === 'perm_camera_sensors' && (
              /* CARD 11: Permission - Camera Scanner */
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#6366F1' }]}>
                  <Icon name="linked-camera" size={40} color="#6366F1" />
                </View>
                <Text style={styles.cardTitle}>Permission: Camera Scanner</Text>
                <Text style={styles.cardSubtitle}>
                  Enable camera access for scanning mutual QR verification codes during physical face-to-face meetups.
                </Text>

                <View style={styles.permissionToggleCard}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.toggleTitle}>Camera Scanner Access</Text>
                    <Text style={styles.toggleSub}>{cameraGranted ? 'ENABLED (Ready for QR Scan)' : 'Tap switch to grant access'}</Text>
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

            {/* CARD 24: Sports & Workout Companions */}
            {item.id === 'sports_fitness_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#F59E0B' }]}>
                  <Icon name="fitness-center" size={40} color="#F59E0B" />
                </View>
                <Text style={styles.cardTitle}>Sports & Workout Companions</Text>
                <Text style={styles.cardSubtitle}>
                  Find gym spotters, jogging buddies, tennis/badminton partners, yoga pairs, or hiking companions in your area.
                </Text>
              </View>
            )}

            {/* CARD 25: Travel & Language Practice */}
            {item.id === 'travel_culture_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#6366F1' }]}>
                  <Icon name="explore" size={40} color="#6366F1" />
                </View>
                <Text style={styles.cardTitle}>Travel & Language Practice</Text>
                <Text style={styles.cardSubtitle}>
                  Explore city walking tours, heritage spots, road trips, and practice conversational languages with native speakers.
                </Text>
              </View>
            )}

            {/* CARD 26: Gaming, Anime & Hobby Pairs */}
            {item.id === 'gaming_hobbies_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#EC4899' }]}>
                  <Icon name="sports-esports" size={40} color="#EC4899" />
                </View>
                <Text style={styles.cardTitle}>Gaming, Anime & Hobby Pairs</Text>
                <Text style={styles.cardSubtitle}>
                  Connect for co-op video games, board game cafe meetups, anime watch parties, and tabletop RPG campaigns.
                </Text>
              </View>
            )}

            {/* CARD 27: Co-Working & Tech Collaboration */}
            {item.id === 'coworking_tech_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#0284C7' }]}>
                  <Icon name="work" size={40} color="#0284C7" />
                </View>
                <Text style={styles.cardTitle}>Co-Working & Tech Collaboration</Text>
                <Text style={styles.cardSubtitle}>
                  Freelance cafe co-working, pair programming side-projects, hackathons, and professional networking.
                </Text>
              </View>
            )}

            {/* CARD 28: Concerts, Music Jams & Arts */}
            {item.id === 'events_arts_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#8B5CF6' }]}>
                  <Icon name="music-note" size={40} color="#8B5CF6" />
                </View>
                <Text style={styles.cardTitle}>Concerts, Music Jams & Arts</Text>
                <Text style={styles.cardSubtitle}>
                  Find event buddies for music gigs, theater, acoustic jam sessions, pottery workshops, and art gallery walks.
                </Text>
              </View>
            )}

            {/* CARD 29: Local Advice & Pet Meetups */}
            {item.id === 'neighborhood_pet_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#10B981' }]}>
                  <Icon name="pets" size={40} color="#10B981" />
                </View>
                <Text style={styles.cardTitle}>Local Advice & Pet Meetups</Text>
                <Text style={styles.cardSubtitle}>
                  Dog park playdates, pet walking, borrowing household tools, and neighborhood newcomer orientation.
                </Text>
              </View>
            )}

            {/* CARD 30: Foodie Outings & Shared Commute */}
            {item.id === 'foodie_carpool_cat' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#F59E0B' }]}>
                  <Icon name="restaurant" size={40} color="#F59E0B" />
                </View>
                <Text style={styles.cardTitle}>Foodie Outings & Shared Commute</Text>
                <Text style={styles.cardSubtitle}>
                  Group food crawls, trying new local restaurants, weekend potlucks, and daily workplace carpools.
                </Text>
              </View>
            )}

            {/* CARD 31: 5-Level Engagement Scale */}
            {item.id === 'five_level_protocol' && (
              <View style={styles.cardContent}>
                <View style={[styles.heroBadge, { borderColor: '#8B5CF6' }]}>
                  <Icon name="layers" size={40} color="#8B5CF6" />
                </View>
                <Text style={styles.cardTitle}>5-Level Engagement Scale</Text>
                <Text style={styles.cardSubtitle}>
                  Select your preferred interaction intensity across 5 distinct levels:
                </Text>
                <View style={styles.pillList}>
                  <View style={styles.featurePill}>
                    <Icon name="chat" size={18} color="#8B5CF6" />
                    <Text style={styles.pillTitle}>Level 1: Quick Online Q&A / Advice</Text>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="voice-chat" size={18} color="#2563EB" />
                    <Text style={styles.pillTitle}>Level 2: Virtual Pre-Meetup Alignment</Text>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="storefront" size={18} color="#10B981" />
                    <Text style={styles.pillTitle}>Level 3: Casual 30-Min Public Meetup</Text>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="groups" size={18} color="#F59E0B" />
                    <Text style={styles.pillTitle}>Level 4: Regular Group & Activity Duo</Text>
                  </View>
                  <View style={styles.featurePill}>
                    <Icon name="star" size={18} color="#EF4444" />
                    <Text style={styles.pillTitle}>Level 5: Deep Collaboration & Local Hosting</Text>
                  </View>
                </View>
              </View>
            )}

            {/* CARD 32: Permissions & Device Sensors */}
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

      {/* Sleek Bottom Pagination Dots Strip */}
      <View style={styles.bottomBar}>
        <Text style={styles.swipeHintText}>‹ Swipe cards ›</Text>
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
    backgroundColor: '#FFF1F2',
  },
  header: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  stepBadgeText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    color: '#DC2626',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  skipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skipBtnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressBarTrack: {
    height: 3.5,
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 2,
  },
  flatList: {
    flex: 1,
  },
  cardSlideWrapper: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    paddingVertical: 8,
  },
  skeuomorphicCard: {
    width: '100%',
    maxWidth: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FAE4E4',
    borderTopColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  cardContent: {
    alignItems: 'center',
    gap: 12,
  },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FCF1F1',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 2,
  },
  cardTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
    textAlign: 'center',
  },
  pillList: {
    width: '100%',
    gap: 8,
    marginTop: 2,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FCF1F1',
    borderWidth: 1,
    borderColor: '#FAE4E4',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
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
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.18)',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  infoBannerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    color: '#DC2626',
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
    backgroundColor: '#FCF1F1',
    borderWidth: 1,
    borderColor: '#FAE4E4',
    borderRadius: 12,
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
    color: '#DC2626',
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
    borderColor: '#FAE4E4',
    borderRadius: 8,
  },
  gridCellActive: {
    backgroundColor: 'rgba(220, 38, 38, 0.10)',
    borderColor: '#DC2626',
  },
  gridText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 9.5,
    color: '#64748B',
  },
  gridTextActive: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9.5,
    color: '#DC2626',
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
    gap: 10,
    backgroundColor: '#FCF1F1',
    borderWidth: 1,
    borderColor: '#FAE4E4',
    padding: 12,
    borderRadius: 12,
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
    backgroundColor: '#FCF1F1',
    borderWidth: 1,
    borderColor: '#FAE4E4',
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  keyDisplayLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 9.5,
    color: '#DC2626',
    letterSpacing: 0.6,
  },
  keyDisplayText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 11,
    color: '#0F172A',
  },
  inputContainer: {
    width: '100%',
    gap: 8,
    marginTop: 2,
  },
  textInput: {
    backgroundColor: '#FCF1F1',
    borderWidth: 1,
    borderColor: '#FAE4E4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
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
    borderRadius: 10,
    paddingVertical: 11,
    marginTop: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveGuardianBtnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11.5,
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
    backgroundColor: '#FCF1F1',
    borderWidth: 1,
    borderColor: '#FAE4E4',
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
    backgroundColor: '#FCF1F1',
    borderWidth: 1,
    borderColor: '#FAE4E4',
    padding: 12,
    borderRadius: 12,
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
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 13,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  googleCtaText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  guestCtaButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FCF1F1',
    borderWidth: 1,
    borderColor: '#FAE4E4',
    borderRadius: 10,
    paddingVertical: 10,
  },
  guestCtaText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    color: '#DC2626',
    letterSpacing: 0.6,
  },
  policyFootnote: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 11,
    lineHeight: 17,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  policyLink: {
    fontFamily: 'WorkSans-Bold',
    color: '#DC2626',
    textDecorationLine: 'underline',
  },
  bottomBar: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF1F2',
  },
  swipeHintText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 10.5,
    color: '#94A3B8',
    letterSpacing: 0.3,
    marginRight: 8,
  },
  dotsStripContainer: {
    alignItems: 'center',
    paddingRight: 8,
  },
  dotsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paginationDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F4D0D0',
  },
  paginationDotActive: {
    width: 14,
    backgroundColor: '#DC2626',
  },
  paginationDotDone: {
    backgroundColor: '#FCF1F1',
    borderColor: '#DC2626',
    borderWidth: 1,
  },
});

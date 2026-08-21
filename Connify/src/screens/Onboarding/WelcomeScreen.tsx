import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  Alert,
  PermissionsAndroid,
  Platform,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, useTheme } from '../../theme';
import { StandardButton } from '../../components/buttons/StandardButton';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { locationService } from '../../services/locationService';
import { API_BASE_URL } from '@env';

export default function WelcomeScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { isAuthenticated, signInAnonymously, sendEmailOtp, verifyEmailOtp } = useAuthStore();
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { fetchLocation } = useLocationStore();

  // Email OTP state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState<'safety' | 'data' | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!API_BASE_URL) {
      console.error('CRITICAL CONFIG ERROR: API_BASE_URL environment variable is missing.');
      return;
    }
    const backendUrl = API_BASE_URL;
    fetch(backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`)
      .then(() => console.log('Backend wake-up signal sent successfully'))
      .catch((err) => console.log('Backend wake-up signal status:', err));

    if (isAuthenticated) {
      navigation.replace('Main');
    }
  }, [isAuthenticated, navigation]);

  const handleGetStarted = async () => {
    if (!locationGranted || !cameraGranted || !notificationsGranted) {
      Alert.alert(
        'Permissions Required',
        'Connify relies on peer-to-peer location tracking and alerts. You must enable Location, Notifications, and Camera access to join the network.'
      );
      return;
    }

    setLoading(true);
    try {
      await fetchLocation();

      await signInAnonymously();

      const { sessionToken, error } = useAuthStore.getState();
      if (error) throw new Error(error);
      if (!sessionToken) throw new Error('Authentication failed — no session token received.');

      navigation.replace('Main');
    } catch (err: any) {
      console.error('Auth setup failed:', err);
      Alert.alert('Authentication Error', err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!emailInput.trim() || !emailInput.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await sendEmailOtp(emailInput.trim());
      if (res.success) {
        setOtpSent(true);
        if (res.devOtp) setDevOtpHint(res.devOtp);
        Alert.alert('OTP Dispatched', res.message || '7-digit security verification code sent to your email.');
      } else {
        Alert.alert('Dispatch Failed', res.message || 'Could not send verification code.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to dispatch OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput.trim() || otpInput.trim().length < 6) {
      Alert.alert('Invalid OTP', 'Please enter the full 7-digit OTP code.');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await verifyEmailOtp(emailInput.trim(), otpInput.trim());
      if (res.success) {
        setShowEmailModal(false);
        navigation.replace('Main');
      } else {
        Alert.alert('Verification Failed', res.message || 'Invalid or expired OTP code.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to verify OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLocationToggle = async (value: boolean) => {
    if (value) {
      const granted = await locationService.requestLocationPermission();
      setLocationGranted(granted);
      if (!granted) {
        Alert.alert('Permission Denied', 'Location permission is required for core app features.');
      }
    } else {
      setLocationGranted(false);
    }
  };

  const handleCameraToggle = async (value: boolean) => {
    if (value) {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Connify needs access to your camera for scanning devices and QR codes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setCameraGranted(isGranted);
        if (!isGranted) {
          Alert.alert('Permission Denied', 'Camera permission is required for scanning features.');
        }
      } else {
        setCameraGranted(true);
      }
    } else {
      setCameraGranted(false);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'Connify needs access to send you critical safety alerts.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setNotificationsGranted(isGranted);
        if (!isGranted) {
          Alert.alert('Permission Denied', 'Notifications are highly recommended for safety updates.');
        }
      } else {
        setNotificationsGranted(true);
      }
    } else {
      setNotificationsGranted(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.outline }]}>
        <View style={styles.headerBranding}>
          <Icon name="security" size={26} color={colors.primary} />
          <Text style={[styles.headerText, { color: colors.primary }]}>Connify</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={[styles.heroDecorator, { backgroundColor: colors.primary }]} />
          <Text style={[styles.heroTitle, { color: colors.onBackground }]}>
            Safety coordinated by <Text style={{ color: colors.primary }}>those nearby.</Text>
          </Text>
          <Text style={[styles.heroDescription, { color: colors.onSurfaceVariant }]}>
            Connify isn't just an alert—it's a rapid response protocol. We bridge emergency services and the verified community around you.
          </Text>
        </View>

        {/* Bento Grid */}
        <View style={styles.explainerSection}>
          <Text style={[styles.sectionLabel, { color: colors.onBackground }]}>PROTOCOL EXPLAINER</Text>
          <View style={styles.bentoGrid}>
            <View style={[styles.primaryBentoCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
              <Icon name="emergency" size={38} color={colors.primary} />
              <Text style={[styles.primaryBentoText, { color: colors.onBackground }]}>
                Request help when you need a nearby connection.
              </Text>
            </View>

            <View style={[styles.secondaryBentoCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
              <Icon name="groups" size={22} color={colors.onBackground} />
              <Text style={[styles.secondaryBentoTitle, { color: colors.onBackground }]}>Verified Responders</Text>
            </View>

            <View style={[styles.darkBentoCard, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
              <Icon name="radar" size={22} color={colors.primary} />
              <Text style={[styles.darkBentoTitle, { color: colors.onBackground }]}>Live Coordination</Text>
            </View>

            <View style={[styles.secondaryBentoCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
              <Icon name="shield" size={22} color={colors.primary} />
              <Text style={[styles.secondaryBentoTitle, { color: colors.onBackground }]}>Privacy by Design</Text>
            </View>
          </View>
        </View>

        {/* Required Permissions */}
        <View style={styles.permissionsSection}>
          <Text style={[styles.sectionLabel, { color: colors.onBackground }]}>REQUIRED PERMISSIONS</Text>

          <View style={[styles.permissionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <View style={styles.permissionInfo}>
              <View style={[styles.permissionIconWrapper, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
                <Icon name="my-location" size={22} color={colors.onBackground} />
              </View>
              <View style={styles.permissionTextWrapper}>
                <Text style={[styles.permissionTitle, { color: colors.onBackground }]}>Precise Location</Text>
                <Text style={[styles.permissionSub, { color: colors.onSurfaceVariant }]}>To find responders nearest to you.</Text>
              </View>
            </View>
            <Switch
              value={locationGranted}
              onValueChange={handleLocationToggle}
              trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.permissionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <View style={styles.permissionInfo}>
              <View style={[styles.permissionIconWrapper, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
                <Icon name="notifications" size={22} color={colors.onBackground} />
              </View>
              <View style={styles.permissionTextWrapper}>
                <Text style={[styles.permissionTitle, { color: colors.onBackground }]}>Critical Alerts</Text>
                <Text style={[styles.permissionSub, { color: colors.onSurfaceVariant }]}>Bypass silent mode for safety updates.</Text>
              </View>
            </View>
            <Switch
              value={notificationsGranted}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.permissionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <View style={styles.permissionInfo}>
              <View style={[styles.permissionIconWrapper, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
                <Icon name="camera-alt" size={22} color={colors.onBackground} />
              </View>
              <View style={styles.permissionTextWrapper}>
                <Text style={[styles.permissionTitle, { color: colors.onBackground }]}>Camera Access</Text>
                <Text style={[styles.permissionSub, { color: colors.onSurfaceVariant }]}>To scan devices and verify responders.</Text>
              </View>
            </View>
            <Switch
              value={cameraGranted}
              onValueChange={handleCameraToggle}
              trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Text style={[styles.footnote, { color: colors.onSurfaceVariant }]}>
          By continuing, you agree to Connify's <Text style={[styles.footnoteBold, { color: colors.onBackground }]} onPress={() => setShowPolicyModal('safety')}>Safety Protocol</Text> and <Text style={[styles.footnoteBold, { color: colors.onBackground }]} onPress={() => setShowPolicyModal('data')}>Data Protection Policy</Text>.
        </Text>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.outline }]}>
        <StandardButton
          title={loading ? 'COORDINATING...' : 'GET STARTED (ANONYMOUS)'}
          onPress={handleGetStarted}
          loading={loading}
          icon={!loading && <Icon name="arrow-forward" size={20} color="#FFFFFF" />}
          style={styles.ctaButton}
        />
        
        <TouchableOpacity
          style={[styles.emailOtpButton, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}
          onPress={() => setShowEmailModal(true)}
        >
          <Icon name="mark-email-read" size={18} color={colors.primary} />
          <Text style={[styles.emailOtpButtonText, { color: colors.onBackground }]}>AUTHENTICATE WITH EMAIL OTP</Text>
        </TouchableOpacity>
      </View>

      {/* EMAIL OTP MODAL */}
      <Modal visible={showEmailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <View style={styles.modalHeader}>
              <Icon name="mark-email-read" size={28} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.onBackground }]}>Email OTP Security Verification</Text>
              <TouchableOpacity onPress={() => setShowEmailModal(false)}>
                <Icon name="close" size={22} color={colors.onBackground} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSub, { color: colors.onSurfaceVariant }]}>
              Enter your email to receive a 7-digit zero-trust verification code.
            </Text>

            {!otpSent ? (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.onBackground }]}>EMAIL ADDRESS</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.onBackground, borderColor: colors.outline }]}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.onSurfaceVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={emailInput}
                  onChangeText={setEmailInput}
                />
                <StandardButton
                  title={otpLoading ? 'SENDING OTP...' : 'SEND OTP CODE'}
                  onPress={handleSendOtp}
                  loading={otpLoading}
                  style={{ marginTop: 10 }}
                />
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.onBackground }]}>7-DIGIT OTP CODE</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.primary, borderColor: colors.primary, fontSize: 24, letterSpacing: 6, textAlign: 'center' }]}
                  placeholder="1234567"
                  placeholderTextColor={colors.onSurfaceVariant}
                  keyboardType="number-pad"
                  maxLength={7}
                  value={otpInput}
                  onChangeText={setOtpInput}
                />
                {devOtpHint && (
                  <Text style={{ color: '#10B981', fontSize: 12, textAlign: 'center', marginTop: 4, fontFamily: 'SpaceGrotesk-Bold' }}>
                    DEV OTP HINT: {devOtpHint}
                  </Text>
                )}
                <StandardButton
                  title={otpLoading ? 'VERIFYING...' : 'VERIFY & SIGN IN'}
                  onPress={handleVerifyOtp}
                  loading={otpLoading}
                  style={{ marginTop: 10 }}
                />
                <TouchableOpacity onPress={() => setOtpSent(false)} style={{ alignSelf: 'center', marginTop: 8 }}>
                  <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, textDecorationLine: 'underline' }}>
                    Resend Code or Change Email
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* POLICY MODALS */}
      <Modal visible={!!showPolicyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <View style={styles.modalHeader}>
              <Icon name={showPolicyModal === 'safety' ? 'shield' : 'privacy-tip'} size={28} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.onBackground }]}>
                {showPolicyModal === 'safety' ? 'Safety Protocol' : 'Data Protection'}
              </Text>
              <TouchableOpacity onPress={() => setShowPolicyModal(null)}>
                <Icon name="close" size={22} color={colors.onBackground} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={[styles.modalSub, { color: colors.onSurfaceVariant, marginTop: 10 }]}>
                {showPolicyModal === 'safety' ? 
                  'Connify is a decentralized safety network. By using this platform, you agree to act as a verified responder when possible, and only trigger emergency alerts in genuine situations of distress. Misuse of the panic system may result in a network ban.' 
                  : 
                  'Your location data is only tracked during active emergency episodes or when functioning as a nearby responder. All communication is secured via end-to-end encryption, and cryptographic audit proofs are stored to prevent tampering.'}
              </Text>
            </ScrollView>
            <StandardButton title="I UNDERSTAND" onPress={() => setShowPolicyModal(null)} style={{ marginTop: 20 }} />
          </View>
        </View>
      </Modal>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 22,
    color: theme.colors.primary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.containerPadding,
    paddingTop: theme.spacing.stackGap,
    paddingBottom: 160,
    gap: 24,
  },
  heroSection: {
    gap: 10,
  },
  heroDecorator: {
    width: 56,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.spacing.radiusFull,
  },
  heroTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 26,
    lineHeight: 34,
    color: theme.colors.onBackground,
  },
  heroTitleHighlight: {
    color: theme.colors.primary,
  },
  heroDescription: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.onSurfaceVariant,
  },
  explainerSection: {
    gap: 10,
  },
  sectionLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: theme.colors.onBackground,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: theme.spacing.inlineGap,
  },
  primaryBentoCard: {
    width: '48.5%',
    minHeight: 124,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusMd,
    padding: 14,
    justifyContent: 'space-between',
  },
  primaryBentoText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.onBackground,
  },
  secondaryBentoCard: {
    width: '48.5%',
    minHeight: 124,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusMd,
    padding: 10,
    justifyContent: 'space-between',
  },
  secondaryBentoTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: theme.colors.onBackground,
    textTransform: 'uppercase',
  },
  darkBentoCard: {
    width: '48.5%',
    minHeight: 124,
    backgroundColor: theme.colors.onBackground,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusMd,
    padding: 10,
    justifyContent: 'space-between',
  },
  darkBentoTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  permissionsSection: {
    gap: 10,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  permissionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  permissionTextWrapper: {
    flex: 1,
  },
  permissionTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 14,
    color: theme.colors.onBackground,
  },
  permissionSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 1,
  },
  footnote: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  footnoteBold: {
    fontFamily: theme.fontFamilies.secondary.bold,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    textDecorationLine: 'underline',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.containerPadding,
    borderTopWidth: theme.spacing.borderWidthHeavy,
    borderTopColor: theme.colors.outline,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row-reverse',
  },
  emailOtpButton: {
    width: '100%',
    maxWidth: 440,
    marginTop: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emailOtpButtonText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    flex: 1,
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 16,
    marginLeft: 10,
  },
  modalSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  inputGroup: {
    gap: 8,
    marginTop: 8,
  },
  inputLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    letterSpacing: 1,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 15,
  },
});

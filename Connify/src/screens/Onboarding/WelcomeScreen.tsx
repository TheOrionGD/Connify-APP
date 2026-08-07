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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';
import { StandardButton } from '../../components/buttons/StandardButton';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { locationService } from '../../services/locationService';
import { API_BASE_URL } from '@env';

export default function WelcomeScreen({ navigation }: any) {
  const { isAuthenticated, signInAnonymously } = useAuthStore();
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { fetchLocation } = useLocationStore();

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
    setLoading(true);
    try {
      if (locationGranted) {
        await fetchLocation();
      }

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerBranding}>
          <Icon name="security" size={26} color={theme.colors.primary} />
          <Text style={styles.headerText}>Connify</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroDecorator} />
          <Text style={styles.heroTitle}>
            Safety coordinated by <Text style={styles.heroTitleHighlight}>those nearby.</Text>
          </Text>
          <Text style={styles.heroDescription}>
            Connify isn't just an alert—it's a rapid response protocol. We bridge emergency services and the verified community around you.
          </Text>
        </View>

        {/* Bento Grid */}
        <View style={styles.explainerSection}>
          <Text style={styles.sectionLabel}>PROTOCOL EXPLAINER</Text>
          <View style={styles.bentoGrid}>
            <View style={styles.primaryBentoCard}>
              <Icon name="emergency" size={38} color={theme.colors.primary} />
              <Text style={styles.primaryBentoText}>
                Signal for help instantly when you feel unsafe.
              </Text>
            </View>

            <View style={styles.bentoRightColumn}>
              <View style={styles.secondaryBentoCard}>
                <Icon name="groups" size={22} color={theme.colors.onBackground} />
                <Text style={styles.secondaryBentoTitle}>Verified Responders</Text>
              </View>

              <View style={styles.darkBentoCard}>
                <Icon name="radar" size={22} color="#FFFFFF" />
                <Text style={styles.darkBentoTitle}>Live Coordination</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Required Permissions */}
        <View style={styles.permissionsSection}>
          <Text style={styles.sectionLabel}>REQUIRED PERMISSIONS</Text>

          <View style={styles.permissionCard}>
            <View style={styles.permissionInfo}>
              <View style={styles.permissionIconWrapper}>
                <Icon name="my-location" size={22} color={theme.colors.onBackground} />
              </View>
              <View style={styles.permissionTextWrapper}>
                <Text style={styles.permissionTitle}>Precise Location</Text>
                <Text style={styles.permissionSub}>To find responders nearest to you.</Text>
              </View>
            </View>
            <Switch
              value={locationGranted}
              onValueChange={handleLocationToggle}
              trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.permissionCard}>
            <View style={styles.permissionInfo}>
              <View style={styles.permissionIconWrapper}>
                <Icon name="notifications" size={22} color={theme.colors.onBackground} />
              </View>
              <View style={styles.permissionTextWrapper}>
                <Text style={styles.permissionTitle}>Critical Alerts</Text>
                <Text style={styles.permissionSub}>Bypass silent mode for safety updates.</Text>
              </View>
            </View>
            <Switch
              value={notificationsGranted}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.permissionCard}>
            <View style={styles.permissionInfo}>
              <View style={styles.permissionIconWrapper}>
                <Icon name="camera-alt" size={22} color={theme.colors.onBackground} />
              </View>
              <View style={styles.permissionTextWrapper}>
                <Text style={styles.permissionTitle}>Camera Access</Text>
                <Text style={styles.permissionSub}>To scan devices and verify responders.</Text>
              </View>
            </View>
            <Switch
              value={cameraGranted}
              onValueChange={handleCameraToggle}
              trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.footnote}>
          By continuing, you agree to Connify's <Text style={styles.footnoteBold}>Safety Protocol</Text> and <Text style={styles.footnoteBold}>Data Protection Policy</Text>.
        </Text>
      </ScrollView>

      <View style={styles.bottomBar}>
        <StandardButton
          title={loading ? 'COORDINATING...' : 'GET STARTED'}
          onPress={handleGetStarted}
          loading={loading}
          icon={!loading && <Icon name="arrow-forward" size={20} color="#FFFFFF" />}
          style={styles.ctaButton}
        />
      </View>
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
    paddingBottom: 110,
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
    height: 170,
    gap: theme.spacing.inlineGap,
  },
  primaryBentoCard: {
    flex: 1,
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
  bentoRightColumn: {
    flex: 1,
    gap: theme.spacing.inlineGap,
  },
  secondaryBentoCard: {
    flex: 1,
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
    flex: 1,
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
});

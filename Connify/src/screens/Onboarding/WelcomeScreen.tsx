import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  SafeAreaView,
  Alert,
} from 'react-native';
import { theme } from '../../theme';
import { StandardButton } from '../../components/buttons/StandardButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../../stores/authStore';
import { secureKeyService } from '../../services/secureKeyService';
import { deviceApi } from '../../services/api/deviceApi';


export default function WelcomeScreen({ navigation }: any) {
  const { isAuthenticated, signInWithEmail } = useAuthStore();
  const [locationGranted, setLocationGranted] = useState(true);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Main');
    }
  }, [isAuthenticated, navigation]);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      // 1. Sign in with Firebase + automatically register device.
      //    authStore.signInWithEmail handles the full flow:
      //      a) Firebase auth → Firebase ID token
      //      b) Derives device fingerprint + Ed25519 keypair from hardware ID
      //      c) Calls POST /api/devices/register with Firebase token
      //      d) Replaces sessionToken with the returned Ed25519 device JWT (30d)
      await signInWithEmail('guest.user@connify.app', 'firebaseSecurePass123');

      // Verify sign-in succeeded (registerDevice may fail silently on network error)
      const { sessionToken, error } = useAuthStore.getState();
      if (error) throw new Error(error);
      if (!sessionToken) throw new Error('Authentication failed — no session token received.');

      // 2. (Optional) Cryptographic challenge-response device verification.
      //    Uses the device JWT (now in sessionToken) against the authenticate middleware.
      const publicKey = await secureKeyService.getPublicKey();
      const challenge = 'connify-verify-challenge-' + Date.now();
      const signature = await secureKeyService.signChallenge(challenge);

      const verifyRes = await deviceApi.verifyDevice(challenge, signature);
      if (!verifyRes.success || !verifyRes.data.verified) {
        throw new Error(verifyRes.data.message || 'Device verification failed');
      }

      navigation.replace('Main');
    } catch (err: any) {
      console.error('Auth setup failed:', err);
      Alert.alert('Authentication Error', err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Centered Top AppBar */}
      <View style={styles.header}>
        <View style={styles.headerBranding}>
          <Icon name="security" size={28} color={theme.colors.primary} />
          <Text style={styles.headerText}>Connify</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroDecorator} />
          <Text style={styles.heroTitle}>
            Safety coordinated by <Text style={styles.heroTitleHighlight}>those nearby.</Text>
          </Text>
          <Text style={styles.heroDescription}>
            Connify isn't just an alert—it's a rapid response protocol. We bridge the gap between emergency services and the verified community around you.
          </Text>
        </View>

        {/* Protocol Explainer (Asymmetric Bento Grid) */}
        <View style={styles.explainerSection}>
          <Text style={styles.sectionLabel}>PROTOCOL EXPLAINER</Text>
          <View style={styles.bentoGrid}>
            {/* Primary Bento Card (Span 2 Rows) */}
            <View style={styles.primaryBentoCard}>
              <Icon name="emergency-share" size={40} color={theme.colors.primary} />
              <Text style={styles.primaryBentoText}>
                Signal for help instantly when you feel unsafe.
              </Text>
            </View>
            
            {/* Right Bento Cards Column */}
            <View style={styles.bentoRightColumn}>
              {/* Secondary Accent Card */}
              <View style={styles.secondaryBentoCard}>
                <Icon name="group" size={24} color={theme.colors.onSecondaryContainer} />
                <Text style={styles.secondaryBentoTitle}>Verified Responders</Text>
              </View>

              {/* Dark Accent Card */}
              <View style={styles.darkBentoCard}>
                <Icon name="share-location" size={24} color={theme.colors.background} />
                <Text style={styles.darkBentoTitle}>Live Coordination</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Required Permissions */}
        <View style={styles.permissionsSection}>
          <Text style={styles.sectionLabel}>REQUIRED PERMISSIONS</Text>
          
          {/* Location permission card */}
          <View style={styles.permissionCard}>
            <View style={styles.permissionInfo}>
              <View style={styles.permissionIconWrapper}>
                <Icon name="location-on" size={22} color={theme.colors.onSecondaryFixed} />
              </View>
              <View style={styles.permissionTextWrapper}>
                <Text style={styles.permissionTitle}>Precise Location</Text>
                <Text style={styles.permissionSub}>To find responders nearest to you.</Text>
              </View>
            </View>
            <Switch
              value={locationGranted}
              onValueChange={setLocationGranted}
              trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Notifications permission card */}
          <View style={styles.permissionCard}>
            <View style={styles.permissionInfo}>
              <View style={styles.permissionIconWrapper}>
                <Icon name="notifications-active" size={22} color={theme.colors.onSecondaryFixed} />
              </View>
              <View style={styles.permissionTextWrapper}>
                <Text style={styles.permissionTitle}>Critical Alerts</Text>
                <Text style={styles.permissionSub}>Bypass silent mode for safety updates.</Text>
              </View>
            </View>
            <Switch
              value={notificationsGranted}
              onValueChange={setNotificationsGranted}
              trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Terms footnote */}
        <Text style={styles.footnote}>
          By continuing, you agree to Connify's <Text style={styles.footnoteBold}>Safety Protocol</Text> and <Text style={styles.footnoteBold}>Data Protection Policy</Text>.
        </Text>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <StandardButton
          title={loading ? 'COORDINATING...' : 'GET STARTED'}
          onPress={handleGetStarted}
          loading={loading}
          icon={!loading && <Icon name="arrow-forward" size={20} color={theme.colors.onPrimary} />}
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
    height: 64,
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.outlineVariant,
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
    paddingBottom: 110, // make space for bottom sticky bar
    gap: 28,
  },
  heroSection: {
    gap: 12,
  },
  heroDecorator: {
    width: 64,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.spacing.radiusFull,
  },
  heroTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 28,
    lineHeight: 36,
    color: theme.colors.onSurface,
  },
  heroTitleHighlight: {
    color: theme.colors.primary,
  },
  heroDescription: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.onSurfaceVariant,
  },
  explainerSection: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: theme.colors.onBackground,
    letterSpacing: 1.5,
  },
  bentoGrid: {
    flexDirection: 'row',
    height: 180,
    gap: theme.spacing.inlineGap,
  },
  primaryBentoCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: theme.colors.primary,
    borderRadius: theme.spacing.radiusMd,
    padding: theme.spacing.containerPadding * 0.75,
    justifyContent: 'space-between',
  },
  primaryBentoText: {
    fontFamily: theme.fontFamilies.technical.medium,
    fontSize: 14,
    lineHeight: 18,
    color: theme.colors.onBackground,
  },
  bentoRightColumn: {
    flex: 1,
    gap: theme.spacing.inlineGap,
  },
  secondaryBentoCard: {
    flex: 1,
    backgroundColor: theme.colors.secondaryContainer,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.onBackground,
    borderRadius: theme.spacing.radiusMd,
    padding: 12,
    justifyContent: 'space-between',
  },
  secondaryBentoTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: theme.colors.onSecondaryContainer,
    textTransform: 'uppercase',
  },
  darkBentoCard: {
    flex: 1,
    backgroundColor: theme.colors.onBackground,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.onBackground,
    borderRadius: theme.spacing.radiusMd,
    padding: 12,
    justifyContent: 'space-between',
  },
  darkBentoTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: theme.colors.background,
    textTransform: 'uppercase',
  },
  permissionsSection: {
    gap: 12,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.onBackground,
    borderRadius: theme.spacing.radiusDefault,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  permissionIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.secondaryFixed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionTextWrapper: {
    flex: 1,
  },
  permissionTitle: {
    fontFamily: theme.fontFamilies.primary.semiBold,
    fontSize: 15,
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
    marginTop: 10,
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
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.containerPadding,
    borderTopWidth: theme.spacing.borderWidthLight,
    borderTopColor: theme.colors.outlineVariant,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row-reverse', // arrow on the right
  },
});

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';
import { StandardButton } from '../../components/buttons/StandardButton';
import { secureKeyService } from '../../services/secureKeyService';
import { useAuthStore } from '../../stores/authStore';
import { useEpisodeStore } from '../../stores/episodeStore';

import QRCode from 'react-native-qrcode-svg';
import { Platform } from 'react-native';

let Camera: any = View;
let useCameraDevice: any = () => null;
let useCameraPermission: any = () => ({ hasPermission: false, requestPermission: async () => false });
let useCodeScanner: any = () => null;

if (Platform.OS !== 'web') {
  const VC = require('react-native-vision-camera');
  Camera = VC.Camera;
  useCameraDevice = VC.useCameraDevice;
  useCameraPermission = VC.useCameraPermission;
  useCodeScanner = VC.useCodeScanner;
}
import { capsuleApi } from '../../services/api/capsuleApi';
import SignalFlow from '../../components/animations/SignalFlow';
import LayeredSuccess from '../../components/animations/LayeredSuccess';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';

const encodeBase64Url = (str: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    let i = 0;
    while (i < str.length) {
        const b1 = str.charCodeAt(i++) & 0xff;
        if (i === str.length) {
            result += chars.charAt(b1 >> 2) + chars.charAt((b1 & 3) << 4);
            break;
        }
        const b2 = str.charCodeAt(i++) & 0xff;
        if (i === str.length) {
            result += chars.charAt(b1 >> 2) + chars.charAt(((b1 & 3) << 4) | (b2 >> 4)) + chars.charAt((b2 & 15) << 2);
            break;
        }
        const b3 = str.charCodeAt(i++) & 0xff;
        result += chars.charAt(b1 >> 2) + chars.charAt(((b1 & 3) << 4) | (b2 >> 4)) + chars.charAt(((b2 & 15) << 2) | (b3 >> 6)) + chars.charAt(b3 & 63);
    }
    return result;
};

export default function HandshakeScreen({ route, navigation }: any) {
  const { episodeId, role, blindedGridCell } = route.params || {};
  const isRequester = role === 'requester';
  
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [scanned, setScanned] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const failureAnim = useSharedValue(0);

  useEffect(() => {
    if (isRequester) {
      generateQrToken();
    } else {
      checkPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRequester]);

  const checkPermissions = async () => {
    if (!hasPermission) {
      await requestPermission();
    }
  };

  const generateQrToken = async () => {
    try {
      const deviceId = useAuthStore.getState().deviceId;
      if (!deviceId) return;

      const header = { alg: 'EdDSA', typ: 'JWT' };
      const payload = {
        episodeId,
        requesterDeviceId: deviceId,
        nonce: crypto.randomUUID(),
        exp: Math.floor(Date.now() / 1000) + 90
      };
      
      const headerB64 = encodeBase64Url(JSON.stringify(header));
      const payloadB64 = encodeBase64Url(JSON.stringify(payload));
      
      const signatureHex = await secureKeyService.signChallenge(`${headerB64}.${payloadB64}`);
      setQrToken(`${headerB64}.${payloadB64}.${signatureHex}`);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to generate QR Code');
    }
  };

  const handleCodeScanned = async (code: string) => {
    if (verifying || scanned) return;
    if (!blindedGridCell) {
      Alert.alert('Location Signal Required', 'Acquiring Geofenced Mesh Location... Please wait for GPS lock before scanning.');
      return;
    }
    setScanned(true);
    setVerifying(true);
    try {
      const deviceId = useAuthStore.getState().deviceId;
      if (!deviceId) throw new Error('Missing device ID');

      const capsuleRes = await capsuleApi.issueCapsule({
        episodeId,
        helperDeviceId: deviceId,
        verificationData: {
          qrToken: code,
          blindedGridCell: blindedGridCell,
        },
      });

      if (capsuleRes.success) {
        setVerified(true);
        setShowSuccessModal(true);
        const setEpisodeId = useEpisodeStore.getState().setEpisodeId;
        const activateEpisode = useEpisodeStore.getState().activateEpisode;
        setEpisodeId(episodeId);
        activateEpisode(`chan-${episodeId}`, 10);
      } else {
        setVerified(false);
        triggerFailureAnimation();
        setErrorMessage('QR verification failed or capsule already issued.');
      }
    } catch (err: any) {
      console.error('Handshake verification failed:', err);
      setVerified(false);
      triggerFailureAnimation();
      
      const isNetworkError = err.message && (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('timeout'));
      const errorMsg = isNetworkError 
        ? 'Network connection dropped during key exchange. Please ensure your connection is stable and try scanning again.' 
        : (err.message || 'Identity verification failed.');
        
      setErrorMessage(errorMsg);
    } finally {
      setVerifying(false);
    }
  };

  const handleRetry = () => {
    setVerified(null);
    setErrorMessage(null);
    setScanned(false);
  };

  const triggerFailureAnimation = () => {
    failureAnim.value = withSequence(
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const failureStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: failureAnim.value }],
    };
  });

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes: any[]) => {
      if (codes.length > 0) {
        const first = codes[0];
        if (first && first.value) {
          handleCodeScanned(first.value);
        }
      }
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Icon
          name="arrow-back"
          size={24}
          color={theme.colors.onBackground}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>IDENTITY HANDSHAKE</Text>
        <Icon name="verified-user" size={24} color={theme.colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Verification Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Zero-Trust Proximity Verification</Text>
          <Text style={styles.cardSub}>
            {isRequester 
              ? 'Present this QR code to the responder upon their arrival.' 
              : 'Scan the QR code presented by the requester to unlock the Trust Capsule.'}
          </Text>

          {isRequester ? (
             qrToken ? (
                <View style={styles.qrContainer}>
                  <QRCode value={qrToken} size={200} />
                </View>
             ) : (
                <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loadingIndicator} />
             )
          ) : (
             <View style={styles.cameraContainer}>
                {hasPermission && device ? (
                   <Camera
                     style={StyleSheet.absoluteFill}
                     device={device}
                     isActive={!scanned && verified === null && Boolean(blindedGridCell)}
                     codeScanner={codeScanner}
                   />
                ) : (
                   <Text style={styles.cameraPermissionText}>Camera permission required</Text>
                )}
                {!blindedGridCell && (
                  <View style={styles.verifyingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.acquiringLocationText}>
                      Acquiring Geofenced Mesh Location... Please wait before scanning.
                    </Text>
                  </View>
                )}
                {verifying && (
                  <View style={styles.verifyingOverlay}>
                    <SignalFlow color={theme.colors.primary} />
                    <Text style={styles.verifyingText}>Verifying Signature...</Text>
                  </View>
                )}
             </View>
          )}

          {episodeId ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>EPISODE ID:</Text>
              <Text style={styles.metaValue}>{episodeId.substring(0, 16)}...</Text>
            </View>
          ) : null}

          {verified !== null ? (
            <Animated.View
              style={[
                styles.statusBadge,
                verified ? styles.statusBadgeSuccess : styles.statusBadgeFailed,
                verified === false ? failureStyle : {},
              ]}
            >
              <Icon
                name={verified ? 'check-circle' : 'cancel'}
                size={18}
                color={verified ? '#059669' : theme.colors.primary}
              />
              <Text style={[styles.statusText, verified ? styles.statusTextSuccess : styles.statusTextFailed]}>
                {verified ? 'IDENTITY VERIFIED' : 'VERIFICATION FAILED'}
              </Text>
            </Animated.View>
          ) : null}

          {errorMessage ? (
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}
        </View>

        {/* Handshake Instructions */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>SAFETY PROTOCOL REQUIREMENTS</Text>
          <View style={styles.bulletRow}>
            <Icon name="security" size={18} color={theme.colors.primary} />
            <Text style={styles.bulletText}>Always remain in well-lit public space during aid response.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="lock" size={18} color={theme.colors.onBackground} />
            <Text style={styles.bulletText}>Device keys are hardware-derived and never leave your phone.</Text>
          </View>
        </View>

        {(!isRequester) && (
          verified === false ? (
            <StandardButton
              title="RETRY SCANNING"
              onPress={handleRetry}
              style={styles.actionButton}
            />
          ) : !scanned ? (
            <StandardButton
              title="CANCEL SCANNING"
              onPress={() => navigation.goBack()}
              style={styles.actionButton}
            />
          ) : null
        )}
      </ScrollView>

      <LayeredSuccess
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.navigate('Main'); // Or let store handle it
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.containerPadding,
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.outline,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    color: theme.colors.onBackground,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  container: {
    padding: theme.spacing.containerPadding,
    gap: 20,
  },
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusMd,
    padding: theme.spacing.containerPadding,
    alignItems: 'center',
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 16,
  },
  cameraContainer: {
    width: 250,
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 18,
    color: theme.colors.onBackground,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  metaLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: theme.colors.onBackground,
  },
  metaValue: {
    fontFamily: theme.fontFamilies.technical.medium,
    fontSize: 12,
    color: theme.colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeSuccess: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  statusBadgeFailed: {
    backgroundColor: '#FEE2E2',
    borderColor: theme.colors.primary,
  },
  statusText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    letterSpacing: 1,
  },
  statusTextSuccess: {
    color: '#059669',
  },
  statusTextFailed: {
    color: theme.colors.primary,
  },
  infoBox: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
    padding: 16,
    gap: 12,
  },
  infoTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: theme.colors.onBackground,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletText: {
    flex: 1,
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    color: theme.colors.onBackground,
    lineHeight: 18,
  },
  actionButton: {
    marginTop: 10,
  },
  errorText: {
    marginTop: 12,
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    color: theme.colors.primary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  loadingIndicator: {
    margin: 40,
  },
  cameraPermissionText: {
    color: theme.colors.onBackground,
  },
  acquiringLocationText: {
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  verifyingText: {
    color: '#fff',
    marginTop: 10,
  },
});

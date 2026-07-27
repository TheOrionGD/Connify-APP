import React, { useState } from 'react';
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
import { deviceApi } from '../../services/api/deviceApi';
import { secureKeyService } from '../../services/secureKeyService';

export default function HandshakeScreen({ route, navigation }: any) {
  const { episodeId, requesterId } = route.params || {};
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);

  const handlePerformHandshake = async () => {
    setVerifying(true);
    try {
      // Perform challenge-response Ed25519 verification with backend
      const challenge = `connify_verify_${Date.now()}`;
      const signature = await secureKeyService.signChallenge(challenge);
      const res = await deviceApi.verifyDevice(challenge, signature);
      
      if (res.success) {
        setVerified(res.data.verified);
        if (res.data.verified) {
          Alert.alert('Verification Successful', 'Cryptographic zero-trust identity verified.');
        } else {
          Alert.alert('Handshake Failed', 'Signature verification failed.');
        }
      }
    } catch (err: any) {
      console.error('Handshake failed:', err);
      Alert.alert('Verification Error', err.message || 'Identity verification failed.');
    } finally {
      setVerifying(false);
    }
  };

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
          <View style={styles.iconCircle}>
            <Icon
              name={verified === true ? 'verified' : 'qr-code-scanner'}
              size={48}
              color={verified === true ? '#059669' : theme.colors.primary}
            />
          </View>

          <Text style={styles.cardTitle}>Zero-Trust Proximity Verification</Text>
          <Text style={styles.cardSub}>
            Verify responder or requester identity cryptographically using Ed25519 hardware key handshake before initiating physical aid.
          </Text>

          {episodeId ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>EPISODE ID:</Text>
              <Text style={styles.metaValue}>{episodeId.substring(0, 16)}...</Text>
            </View>
          ) : null}

          {verified !== null ? (
            <View
              style={[
                styles.statusBadge,
                verified ? styles.statusBadgeSuccess : styles.statusBadgeFailed,
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
            </View>
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

        <StandardButton
          title={verifying ? 'VERIFYING HANDSHAKE...' : 'PERFORM HANDSHAKE'}
          onPress={handlePerformHandshake}
          loading={verifying}
          icon={!verifying && <Icon name="fingerprint" size={22} color="#FFFFFF" />}
          style={styles.actionButton}
        />
      </ScrollView>
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
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
});

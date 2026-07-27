import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';
import { StandardButton } from '../../components/buttons/StandardButton';

export default function ProtocolExplainerScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Icon
          name="arrow-back"
          size={24}
          color={theme.colors.onBackground}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>HOW CONNIFY WORKS</Text>
        <Icon name="shield" size={24} color={theme.colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Rapid Safety Protocol <Text style={styles.highlight}>Without Tracking</Text>
          </Text>
          <Text style={styles.heroSub}>
            Connify bridges community responders and emergency services using 4 zero-trust architectural steps.
          </Text>
        </View>

        {/* Step 1 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>01</Text>
            </View>
            <Text style={styles.stepTitle}>Emergency Signal Broadcast</Text>
          </View>
          <Text style={styles.stepDescription}>
            When you trigger an SOS signal, your phone generates an Ed25519 payload containing your category (Medical, Escort, Threat) and blinded location grid cell.
          </Text>
          <View style={styles.iconRow}>
            <Icon name="warning" size={22} color={theme.colors.primary} />
            <Text style={styles.iconRowLabel}>Instant local grid notification</Text>
          </View>
        </View>

        {/* Step 2 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.stepBadgeText, { color: '#FFFFFF' }]}>02</Text>
            </View>
            <Text style={styles.stepTitle}>Nearby Responder Match</Text>
          </View>
          <Text style={styles.stepDescription}>
            Verified responders within your selected radius receive the anonymized signal and can opt to accept the assistance protocol.
          </Text>
          <View style={styles.iconRow}>
            <Icon name="people" size={22} color={theme.colors.onBackground} />
            <Text style={styles.iconRowLabel}>Community & verified assistance</Text>
          </View>
        </View>

        {/* Step 3 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>03</Text>
            </View>
            <Text style={styles.stepTitle}>Proximity Verification Handshake</Text>
          </View>
          <Text style={styles.stepDescription}>
            When the responder arrives, both devices execute an offline QR/cryptographic challenge-response handshake to confirm identity.
          </Text>
          <View style={styles.iconRow}>
            <Icon name="qr-code" size={22} color={theme.colors.primary} />
            <Text style={styles.iconRowLabel}>Zero-trust identity verification</Text>
          </View>
        </View>

        {/* Step 4 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>04</Text>
            </View>
            <Text style={styles.stepTitle}>Episode Resolution & Data Purge</Text>
          </View>
          <Text style={styles.stepDescription}>
            Once safety is confirmed, the active episode is closed. All temporary location tokens are purged automatically.
          </Text>
          <View style={styles.iconRow}>
            <Icon name="delete-sweep" size={22} color="#059669" />
            <Text style={styles.iconRowLabel}>Automatic data cleanup</Text>
          </View>
        </View>

        <StandardButton
          title="RETURN TO GOVERNANCE"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={styles.bottomButton}
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
    gap: 16,
  },
  heroSection: {
    gap: 8,
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 22,
    lineHeight: 30,
    color: theme.colors.onBackground,
  },
  highlight: {
    color: theme.colors.primary,
  },
  heroSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.onSurfaceVariant,
  },
  stepCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
    padding: 16,
    gap: 10,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.onBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: theme.colors.background,
  },
  stepTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 16,
    color: theme.colors.onBackground,
    flex: 1,
  },
  stepDescription: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.onSurfaceVariant,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceContainerHigh,
  },
  iconRowLabel: {
    fontFamily: theme.fontFamilies.technical.medium,
    fontSize: 12,
    color: theme.colors.onBackground,
  },
  bottomButton: {
    marginTop: 12,
  },
});

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';
import { useAuthStore } from '../../stores/authStore';

export default function GovernanceScreen({ navigation }: any) {
  const { deviceId, user } = useAuthStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerBranding}>
          <Icon name="gavel" size={24} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>GOVERNANCE & PRIVACY</Text>
        </View>
        <Icon
          name="info-outline"
          size={22}
          color={theme.colors.onBackground}
          onPress={() => navigation.navigate('ProtocolExplainer')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Core Guarantee Card */}
        <View style={styles.heroCard}>
          <Icon name="verified-user" size={36} color={theme.colors.primary} />
          <Text style={styles.heroTitle}>Zero-Trust Protocol Guarantees</Text>
          <Text style={styles.heroSub}>
            Connify operates on cryptographic zero-knowledge primitives. No central database tracks your continuous location or personal identifier history.
          </Text>
        </View>

        {/* Governance Pillars Bento Grid */}
        <Text style={styles.sectionLabel}>SAFETY GOVERNANCE PILLARS</Text>
        
        <View style={styles.pillarCard}>
          <View style={styles.pillarHeader}>
            <View style={styles.iconBox}>
              <Icon name="vpn-key" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.pillarTitle}>Ed25519 Hardware Keys</Text>
          </View>
          <Text style={styles.pillarText}>
            Every emergency request and response is signed on-device using isolated keypairs derived from your device's unique hardware identifier.
          </Text>
          <View style={styles.keyTag}>
            <Text style={styles.keyTagLabel}>REGISTERED DEVICE ID:</Text>
            <Text style={styles.keyTagValue} numberOfLines={1}>
              {deviceId || 'REGISTERED (PENDING HANDSHAKE)'}
            </Text>
          </View>
        </View>

        <View style={styles.pillarCard}>
          <View style={styles.pillarHeader}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary }]}>
              <Icon name="location-off" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.pillarTitle}>Blinded Grid Cell Routing</Text>
          </View>
          <Text style={styles.pillarText}>
            Locations are obfuscated into regional grid cells before broadcasting. Exact GPS coordinates are disclosed strictly during confirmed 1-to-1 active emergency episodes.
          </Text>
        </View>

        <View style={styles.pillarCard}>
          <View style={styles.pillarHeader}>
            <View style={styles.iconBox}>
              <Icon name="history" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.pillarTitle}>Ephemeral Audit Chain</Text>
          </View>
          <Text style={styles.pillarText}>
            Emergency episode data automatically expires upon resolution. Immutable cryptographic logs ensure non-repudiation while respecting strict data deletion rights.
          </Text>
        </View>

        {/* Quick Navigation to Explainer */}
        <TouchableOpacity
          style={styles.explainerBanner}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ProtocolExplainer')}
        >
          <View style={styles.bannerInfo}>
            <Icon name="menu-book" size={24} color={theme.colors.primary} />
            <View>
              <Text style={styles.bannerTitle}>Protocol Technical Explainer</Text>
              <Text style={styles.bannerSub}>Read how blinded tokens & mesh coordination work</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
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
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    gap: 18,
  },
  heroCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusMd,
    padding: theme.spacing.containerPadding,
    alignItems: 'center',
    gap: 10,
  },
  heroTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 18,
    color: theme.colors.onBackground,
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: theme.colors.onBackground,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  pillarCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
    padding: 16,
    gap: 10,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: theme.colors.onBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 15,
    color: theme.colors.onBackground,
  },
  pillarText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.onSurfaceVariant,
  },
  keyTag: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: 10,
    borderRadius: 6,
    gap: 4,
    marginTop: 4,
  },
  keyTagLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: theme.colors.onBackground,
    letterSpacing: 1,
  },
  keyTagValue: {
    fontFamily: theme.fontFamilies.technical.medium,
    fontSize: 12,
    color: theme.colors.primary,
  },
  explainerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: theme.colors.primary,
    borderRadius: theme.spacing.radiusDefault,
    padding: 14,
    marginTop: 8,
  },
  bannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bannerTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 14,
    color: theme.colors.onBackground,
  },
  bannerSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
});

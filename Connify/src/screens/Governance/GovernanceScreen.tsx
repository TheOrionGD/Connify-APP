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
import { theme, useTheme } from '../../theme';
import { useAuthStore } from '../../stores/authStore';

export default function GovernanceScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { deviceId, user } = useAuthStore();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.outline }]}>
        <View style={styles.headerBranding}>
          <Icon name="gavel" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>GOVERNANCE & PRIVACY</Text>
        </View>
        <Icon
          name="info-outline"
          size={22}
          color={colors.onBackground}
          onPress={() => navigation.navigate('ProtocolExplainer')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Core Guarantee Card */}
        <View style={[styles.heroCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <Icon name="verified-user" size={36} color={colors.primary} />
          <Text style={[styles.heroTitle, { color: colors.onBackground }]}>Zero-Trust Protocol Guarantees</Text>
          <Text style={[styles.heroSub, { color: colors.onSurfaceVariant }]}>
            Connify operates on cryptographic zero-knowledge primitives. No central database tracks your continuous location or personal identifier history.
          </Text>
        </View>

        {/* Governance Pillars Bento Grid */}
        <Text style={[styles.sectionLabel, { color: colors.onBackground }]}>SAFETY GOVERNANCE PILLARS</Text>
        
        <View style={[styles.pillarCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.pillarHeader}>
            <View style={[styles.iconBox, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
              <Icon name="vpn-key" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.pillarTitle, { color: colors.onBackground }]}>Ed25519 Hardware Keys</Text>
          </View>
          <Text style={[styles.pillarText, { color: colors.onSurfaceVariant }]}>
            Every emergency request and response is signed on-device using isolated keypairs derived from your device's unique hardware identifier.
          </Text>
          <View style={[styles.keyTag, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.keyTagLabel, { color: colors.onBackground }]}>REGISTERED DEVICE ID:</Text>
            <Text style={[styles.keyTagValue, { color: colors.primary }]} numberOfLines={1}>
              {deviceId || 'REGISTERED (PENDING HANDSHAKE)'}
            </Text>
          </View>
        </View>

        <View style={[styles.pillarCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.pillarHeader}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary }]}>
              <Icon name="location-off" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.pillarTitle, { color: colors.onBackground }]}>Blinded Grid Cell Routing</Text>
          </View>
          <Text style={[styles.pillarText, { color: colors.onSurfaceVariant }]}>
            Locations are obfuscated into regional grid cells before broadcasting. Exact GPS coordinates are disclosed strictly during confirmed 1-to-1 active emergency episodes.
          </Text>
        </View>

        <View style={[styles.pillarCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.pillarHeader}>
            <View style={[styles.iconBox, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
              <Icon name="history" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.pillarTitle, { color: colors.onBackground }]}>Ephemeral Audit Chain</Text>
          </View>
          <Text style={[styles.pillarText, { color: colors.onSurfaceVariant }]}>
            Emergency episode data automatically expires upon resolution. Immutable cryptographic logs ensure non-repudiation while respecting strict data deletion rights.
          </Text>
        </View>

        {/* Quick Navigation to Explainer */}
        <TouchableOpacity
          style={[styles.explainerBanner, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.primary }]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ProtocolExplainer')}
        >
          <View style={styles.bannerInfo}>
            <Icon name="menu-book" size={24} color={colors.primary} />
            <View>
              <Text style={[styles.bannerTitle, { color: colors.onBackground }]}>Protocol Technical Explainer</Text>
              <Text style={[styles.bannerSub, { color: colors.onSurfaceVariant }]}>Read how blinded tokens & mesh coordination work</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={colors.onBackground} />
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

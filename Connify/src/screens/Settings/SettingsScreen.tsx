import React, { useState } from 'react';
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
import { StandardButton } from '../../components/buttons/StandardButton';
import { ProfileSetupModal } from '../../components/common/ProfileSetupModal';

export default function SettingsScreen({ navigation }: any) {
  const { user, deviceId, signOut } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Icon name="person" size={24} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>PROFILE & IDENTITY</Text>
        </View>
        <Icon
          name="gavel"
          size={22}
          color={theme.colors.onBackground}
          onPress={() => navigation.navigate('Governance')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Icon name="account-circle" size={44} color={theme.colors.primary} />
            </View>
            <View style={styles.profileTextGroup}>
              <Text style={styles.profileName}>
                {user?.displayName || 'Anonymous Safety Node'}
              </Text>
              <Text style={styles.profileSub}>
                {user?.email || 'Anonymous Firebase Credential'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editProfilePill}
            onPress={() => setShowProfileModal(true)}
          >
            <Icon name="edit" size={16} color={theme.colors.onBackground} />
            <Text style={styles.editProfileText}>EDIT PROFILE DETAILS</Text>
          </TouchableOpacity>
        </View>

        {/* Device Identity Lock Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>DEVICE IDENTITY & CRYPTOGRAPHY</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DEVICE HARDWARE ID:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {deviceId || 'REGISTERED ON BOOT'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>FIREBASE UID:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user?.uid || 'NOT SIGNED IN'}
            </Text>
          </View>
        </View>

        {/* Navigation Actions */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>GOVERNANCE & PROTOCOL</Text>
          
          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.navigate('Governance')}
          >
            <View style={styles.navRowLeft}>
              <Icon name="gavel" size={20} color={theme.colors.primary} />
              <Text style={styles.navRowText}>Zero-Trust Governance</Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.colors.onBackground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.navigate('ProtocolExplainer')}
          >
            <View style={styles.navRowLeft}>
              <Icon name="menu-book" size={20} color={theme.colors.primary} />
              <Text style={styles.navRowText}>How Connify Works</Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.colors.onBackground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.navigate('Feedback')}
          >
            <View style={styles.navRowLeft}>
              <Icon name="rate-review" size={20} color={theme.colors.primary} />
              <Text style={styles.navRowText}>Protocol Feedback & Rating</Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.colors.onBackground} />
          </TouchableOpacity>
        </View>

        <StandardButton
          title="SIGN OUT / RESET DEVICE SESSION"
          onPress={signOut}
          variant="dark"
          style={styles.signOutButton}
        />
      </ScrollView>

      <ProfileSetupModal
        visible={showProfileModal}
        onComplete={() => setShowProfileModal(false)}
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
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.outline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.containerPadding,
    backgroundColor: theme.colors.background,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    color: theme.colors.onBackground,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  container: {
    padding: theme.spacing.containerPadding,
    gap: 16,
  },
  profileCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusMd,
    padding: 18,
    gap: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderWidth: 1.5,
    borderColor: theme.colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextGroup: {
    flex: 1,
  },
  profileName: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 18,
    color: theme.colors.onBackground,
  },
  profileSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  editProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    paddingVertical: 10,
    borderRadius: theme.spacing.radiusDefault,
  },
  editProfileText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: theme.colors.onBackground,
    letterSpacing: 0.8,
  },
  sectionCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: theme.colors.onBackground,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  infoRow: {
    gap: 4,
    padding: 10,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  infoLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: theme.colors.onBackground,
    letterSpacing: 0.8,
  },
  infoValue: {
    fontFamily: theme.fontFamilies.technical.medium,
    fontSize: 12,
    color: theme.colors.primary,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainerHigh,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navRowText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 14,
    color: theme.colors.onBackground,
  },
  signOutButton: {
    marginTop: 12,
  },
});

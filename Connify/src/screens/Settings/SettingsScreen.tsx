import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import { StandardButton } from '../../components/buttons/StandardButton';
import { ProfileSetupModal } from '../../components/common/ProfileSetupModal';

export default function SettingsScreen({ navigation }: any) {
  const { user, userProfile, deviceId, signOut } = useAuthStore();
  const { themeMode, toggleTheme, colors, theme } = useTheme();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isDarkMode = themeMode === 'dark';

  // Derive display name cleanly based on explicit user anonymization and profile setup state
  const isAnonymous = user?.isAnonymous ?? false;
  const fullName = userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : '';
  
  const profileName = isAnonymous
    ? 'Anonymous Safety Node'
    : fullName || user?.displayName || 'Node Setup Pending';

  const profileSub = isAnonymous
    ? 'Privacy-Preserving Credential'
    : user?.email || user?.phoneNumber || (user?.uid ? `UID: ${user.uid.slice(0, 8)}...` : 'Credential Pending');

  // Derive initials for avatar
  const initials = profileName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.outline }]}>
        <View style={styles.headerTitleContainer}>
          <Icon name="person" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>PROFILE & IDENTITY</Text>
        </View>
        <Icon
          name="gavel"
          size={22}
          color={colors.onBackground}
          onPress={() => navigation.navigate('Governance')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.profileHeader}>
            {/* Unified circular avatar — initials if name known, icon if not */}
            <View style={[styles.avatarCircle, { backgroundColor: initials ? colors.primary : colors.surfaceContainerHigh, borderColor: colors.outline }]}>
              {initials ? (
                <Text style={[styles.avatarInitials, { color: '#FFFFFF' }]}>{initials}</Text>
              ) : (
                <Icon name="account-circle" size={44} color={colors.primary} />
              )}
            </View>
            <View style={styles.profileTextGroup}>
              <Text style={[styles.profileName, { color: colors.onBackground }]}>
                {profileName}
              </Text>
              <Text style={[styles.profileSub, { color: colors.onSurfaceVariant }]}>
                {profileSub}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.editProfilePill, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}
            onPress={() => setShowProfileModal(true)}
          >
            <Icon name="edit" size={16} color={colors.onBackground} />
            <Text style={[styles.editProfileText, { color: colors.onBackground }]}>EDIT PROFILE DETAILS</Text>
          </TouchableOpacity>
        </View>

        {/* Theme Settings Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>THEME & APPEARANCE</Text>
          <View style={[styles.themeRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <View style={styles.themeRowLeft}>
              <Icon
                name={isDarkMode ? 'dark-mode' : 'light-mode'}
                size={22}
                color={colors.primary}
              />
              <View>
                <Text style={[styles.themeRowTitle, { color: colors.onBackground }]}>
                  {isDarkMode ? 'Dark Mode (Cinema OLED)' : 'Light Mode'}
                </Text>
                <Text style={[styles.themeRowSub, { color: colors.onSurfaceVariant }]}>
                  {isDarkMode ? 'Default OLED low-contrast mode' : 'High contrast daytime display'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>

        {/* Device Identity Lock Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>DEVICE IDENTITY & CRYPTOGRAPHY</Text>
          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>DEVICE HARDWARE ID:</Text>
            <Text style={[styles.infoValue, { color: colors.primary }]} numberOfLines={1}>
              {deviceId || 'REGISTERED ON BOOT'}
            </Text>
          </View>
          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>FIREBASE UID:</Text>
            <Text style={[styles.infoValue, { color: colors.primary }]} numberOfLines={1}>
              {user?.uid || 'NOT SIGNED IN'}
            </Text>
          </View>
        </View>

        {/* Navigation Actions */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>GOVERNANCE & PROTOCOL</Text>
          
          <TouchableOpacity
            style={[styles.navRow, { borderBottomColor: colors.surfaceContainerHigh }]}
            onPress={() => navigation.navigate('Governance')}
          >
            <View style={styles.navRowLeft}>
              <Icon name="gavel" size={20} color={colors.primary} />
              <Text style={[styles.navRowText, { color: colors.onBackground }]}>Zero-Trust Governance</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.onBackground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navRow, { borderBottomColor: colors.surfaceContainerHigh }]}
            onPress={() => navigation.navigate('WitnessContacts')}
          >
            <View style={styles.navRowLeft}>
              <Icon name="visibility" size={20} color={colors.primary} />
              <Text style={[styles.navRowText, { color: colors.onBackground }]}>Witness Contact Management</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.onBackground} />
          </TouchableOpacity>


          <TouchableOpacity
            style={[styles.navRow, { borderBottomColor: colors.surfaceContainerHigh }]}
            onPress={() => navigation.navigate('ProtocolExplainer')}
          >
            <View style={styles.navRowLeft}>
              <Icon name="menu-book" size={20} color={colors.primary} />
              <Text style={[styles.navRowText, { color: colors.onBackground }]}>How Connify Works</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.onBackground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navRow, { borderBottomColor: colors.surfaceContainerHigh }]}
            onPress={() => navigation.navigate('Feedback')}
          >
            <View style={styles.navRowLeft}>
              <Icon name="rate-review" size={20} color={colors.primary} />
              <Text style={[styles.navRowText, { color: colors.onBackground }]}>Protocol Feedback & Rating</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.onBackground} />
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
  },
  header: {
    height: 56,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 14,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  container: {
    padding: 16,
    gap: 16,
  },
  profileCard: {
    borderWidth: 1,
    borderRadius: 12,
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
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  profileTextGroup: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 18,
  },
  profileSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  editProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
  },
  editProfileText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  themeRowTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 14,
  },
  themeRowSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 11,
    marginTop: 2,
  },
  infoRow: {
    gap: 4,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  infoLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  infoValue: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 12,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navRowText: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 14,
  },
  signOutButton: {
    marginTop: 12,
  },
});

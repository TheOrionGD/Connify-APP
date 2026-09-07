import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeBottomTabBarHeight } from '../../utils/useSafeBottomTabBarHeight';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import { ProfileSetupModal } from '../../components/common/ProfileSetupModal';
import { DialogueModal } from '../../components/common/DialogueModal';
import auth from '@react-native-firebase/auth';
import { normalizePhoneForURI, openWhatsAppContact } from '../../utils/phone';
import { formatEmergencySMSMessage } from '../../utils/smsFormatter';

const GOOGLE_ACCOUNT_DELETION_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfpvdZDBVlvi1_kyUPvEkOzU1XRKyc2pq8gPkxC_4IDjllhDg/viewform';

export default function SettingsScreen({ navigation }: any) {
  const { user, userProfile, signOut, disconnectAccount, signInWithGoogle, fetchProfile } = useAuthStore();
  const { themeMode, toggleTheme, colors } = useTheme();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localGuardian, setLocalGuardian] = useState<{ name: string; phone: string; relationship: string } | null>(null);

  const [showResetModal, setShowResetModal] = useState(false);
  const [deletionEmail, setDeletionEmail] = useState('');
  const [deletionReason, setDeletionReason] = useState('');

  const isDarkMode = themeMode === 'dark';
  const tabBarHeight = useSafeBottomTabBarHeight();

  const handleSignOut = async () => {
    setShowSignOutModal(false);
    try {
      await signOut();
    } catch (e) { }
    const rootNav = navigation?.getParent ? navigation.getParent() : navigation;
    if (rootNav?.reset) {
      rootNav.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } else if (navigation?.navigate) {
      navigation.navigate('Welcome');
    }
  };

  const handleDisconnect = async () => {
    setShowDisconnectModal(false);
    try {
      await disconnectAccount();
    } catch (e) { }
    const rootNav = navigation?.getParent ? navigation.getParent() : navigation;
    if (rootNav?.reset) {
      rootNav.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } else if (navigation?.navigate) {
      navigation.navigate('Welcome');
    }
  };

  const handleOpenDeletionForm = async () => {
    setShowDeletionModal(false);
    setShowResetModal(false);
    try {
      await Linking.openURL(GOOGLE_ACCOUNT_DELETION_FORM_URL);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not open account deletion Google Form link.');
    }
  };

  const handleConfirmDeletionSubmit = async () => {
    setShowResetModal(false);
    Alert.alert(
      'Account Deletion Request Submitted',
      'Your request for account & data deletion has been registered. You can also complete the official Google Form to expedite processing.',
      [
        {
          text: 'Open Official Google Form',
          onPress: handleOpenDeletionForm,
        },
        { text: 'Done', style: 'cancel' },
      ]
    );
  };

  // Load profile and guardian data dynamically
  const refreshAllProfileData = useCallback(async () => {
    await fetchProfile();
    try {
      const data = await AsyncStorage.getItem('@connify_guardian_data');
      if (data) {
        setLocalGuardian(JSON.parse(data));
      }
    } catch (e) { }
  }, [fetchProfile]);

  useFocusEffect(
    useCallback(() => {
      refreshAllProfileData();
    }, [refreshAllProfileData])
  );

  // Derived user values
  const fullName = userProfile
    ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
    : user?.displayName || 'Safety User';

  const profileName = fullName || user?.displayName || 'Safety User';
  const profileEmail = user?.email || userProfile?.email || 'No email attached';
  const profilePhone = userProfile?.phone || user?.phoneNumber || 'Not configured';

  // Derive initials for avatar
  const initials = profileName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('');

  // Firebase native current user representation & avatar photo
  const firebaseUser = auth().currentUser;

  const avatarPhotoUrl =
    user?.photoURL ||
    userProfile?.photo ||
    userProfile?.avatar ||
    firebaseUser?.photoURL ||
    null;

  const isGoogleUser = Boolean(
    firebaseUser?.providerData?.some((p: any) => p.providerId === 'google.com') ||
    (avatarPhotoUrl && avatarPhotoUrl.includes('googleusercontent.com')) ||
    user?.email?.endsWith('@gmail.com') ||
    firebaseUser?.email?.endsWith('@gmail.com') ||
    userProfile?.email?.endsWith('@gmail.com')
  );

  // Parse medical notes and guardian data
  let bloodGroup = 'Not Specified';
  let conditionsList: string[] = [];
  let guardianData = localGuardian;

  if (userProfile?.medicalNotes) {
    try {
      const parsed = JSON.parse(userProfile.medicalNotes);
      if (parsed.bloodGroup) bloodGroup = parsed.bloodGroup;
      if (Array.isArray(parsed.conditions)) conditionsList = parsed.conditions;
      if (parsed.guardian && (parsed.guardian.name || parsed.guardian.phone)) {
        guardianData = parsed.guardian;
      }
    } catch {
      bloodGroup = userProfile.medicalNotes;
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      await fetchProfile();
      Alert.alert('Google Sign-In Success', 'Your Google account data has been synchronized with your profile.');
    } catch (e: any) {
      Alert.alert('Google Sign-In', e.message || 'Google authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.outline }]}>
        <View style={styles.headerTitleContainer}>
          <Icon name="person" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>USER PROFILE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: tabBarHeight + 24 }]} showsVerticalScrollIndicator={false}>
        {/* Profile Identity Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.profileHeader}>
            {avatarPhotoUrl ? (
              <Image source={{ uri: avatarPhotoUrl }} style={[styles.avatarCircle, { borderColor: colors.primary }]} />
            ) : isGoogleUser ? (
              <View style={[styles.avatarCircle, { backgroundColor: '#FFFFFF', borderColor: '#4285F4', borderWidth: 2 }]}>
                <Icon name="account-circle" size={44} color="#4285F4" />
              </View>
            ) : (
              <View style={[styles.avatarCircle, { backgroundColor: colors.primary, borderColor: colors.outline }]}>
                {initials ? (
                  <Text style={[styles.avatarInitials, { color: '#FFFFFF' }]}>{initials}</Text>
                ) : (
                  <Icon name="person" size={32} color="#FFFFFF" />
                )}
              </View>
            )}
            <View style={styles.profileTextGroup}>
              <Text style={[styles.profileName, { color: colors.onBackground }]}>
                {profileName}
              </Text>
              <Text style={[styles.profileSub, { color: colors.onSurfaceVariant }]}>
                {profileEmail}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.editProfilePill, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}
            onPress={() => setShowProfileModal(true)}
            activeOpacity={0.8}
          >
            <Icon name="edit" size={16} color={colors.primary} />
            <Text style={[styles.editProfileText, { color: colors.onBackground }]}>EDIT PROFILE DETAILS</Text>
          </TouchableOpacity>
        </View>

        {/* Google Account Information Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="account-circle" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>GOOGLE ACCOUNT INFORMATION</Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>DISPLAY NAME:</Text>
            <Text style={[styles.infoValue, { color: colors.onBackground }]}>{user?.displayName || 'Google Account Linked'}</Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>MAIL ID (GOOGLE EMAIL):</Text>
            <Text style={[styles.infoValue, { color: colors.onBackground }]}>{user?.email || profileEmail}</Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>GOOGLE USER ID (UID):</Text>
            <Text style={[styles.infoValue, { color: colors.onBackground }]} numberOfLines={1}>{user?.uid || 'Synchronized'}</Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>AUTHENTICATION STATUS:</Text>
            <Text style={[styles.infoValue, { color: '#10B981', fontWeight: '700' }]}>
              {user?.email ? 'OAUTH 2.0 GOOGLE AUTHENTICATED' : 'AUTHENTICATED SESSION'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Icon name="g-mobiledata" size={28} color={colors.primary} />
                <Text style={[styles.googleButtonText, { color: colors.onBackground }]}>
                  {user?.email ? 'RE-SYNCHRONIZE GOOGLE ACCOUNT' : 'SIGN IN WITH GOOGLE'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* User Data Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="badge" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>USER DATA</Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>FULL NAME:</Text>
            <Text style={[styles.infoValue, { color: colors.onBackground }]}>{fullName}</Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>PHONE NUMBER:</Text>
            <Text style={[styles.infoValue, { color: colors.onBackground }]}>{profilePhone}</Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>MAIL ID:</Text>
            <Text style={[styles.infoValue, { color: colors.onBackground }]}>{profileEmail}</Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>BLOOD GROUP:</Text>
            <Text style={[styles.infoValue, { color: '#EC4899', fontWeight: '700' }]}>{bloodGroup}</Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>MEDICAL CONDITIONS & ALLERGIES:</Text>
            <Text style={[styles.infoValue, { color: colors.onBackground }]}>
              {conditionsList.length > 0 ? conditionsList.join(', ') : 'None Reported'}
            </Text>
          </View>
        </View>

        {/* Guardian Details Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="contact-phone" size={20} color="#10B981" />
            <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>PRIMARY GUARDIAN DETAILS</Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>GUARDIAN NAME:</Text>
            <Text style={[styles.infoValue, { color: colors.onBackground }]}>{guardianData?.name || 'Not Configured'}</Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>GUARDIAN PHONE NUMBER:</Text>
            <Text style={[styles.infoValue, { color: colors.onBackground }]}>{guardianData?.phone || 'Not Configured'}</Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
            <Text style={[styles.infoLabel, { color: colors.onBackground }]}>RELATIONSHIP:</Text>
            <Text style={[styles.infoValue, { color: colors.onBackground }]}>{guardianData?.relationship || 'Guardian'}</Text>
          </View>

          {guardianData?.phone ? (() => {
            const telPhone = normalizePhoneForURI(guardianData.phone);
            const smsText = formatEmergencySMSMessage({
              alertType: 'EMERGENCY GUARDIAN ALERT',
              userName: fullName,
              relationship: guardianData.relationship || 'Primary Guardian',
              reason: 'Direct emergency message sent from User Profile page',
              customLocationStr: 'User Profile Page Alert',
            });

            return (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <TouchableOpacity
                  style={[styles.googleButton, { flex: 1, backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={() => Linking.openURL(`tel:${telPhone}`).catch(() => Alert.alert('Error', 'Could not open phone dialer'))}
                  activeOpacity={0.8}
                >
                  <Icon name="phone" size={18} color="#FFFFFF" />
                  <Text style={[styles.googleButtonText, { color: '#FFFFFF', textAlign: 'center' }]}>CALL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.googleButton, { flex: 1, backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}
                  onPress={() =>
                    Linking.openURL(`sms:${telPhone}?body=${encodeURIComponent(smsText)}`).catch(() =>
                      Alert.alert('Error', 'Could not open SMS')
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Icon name="sms" size={18} color={colors.primary} />
                  <Text style={[styles.googleButtonText, { color: colors.onBackground, textAlign: 'center' }]}>SMS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.googleButton, { flex: 1, backgroundColor: '#25D366', borderColor: '#25D366' }]}
                  onPress={() => openWhatsAppContact(guardianData!.phone, smsText)}
                  activeOpacity={0.8}
                >
                  <Icon name="chat" size={18} color="#FFFFFF" />
                  <Text style={[styles.googleButtonText, { color: '#FFFFFF', textAlign: 'center' }]}>WA</Text>
                </TouchableOpacity>
              </View>
            );
          })() : (
            <TouchableOpacity
              style={[styles.editProfilePill, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}
              onPress={() => setShowProfileModal(true)}
              activeOpacity={0.8}
            >
              <Icon name="person-add" size={16} color={colors.primary} />
              <Text style={[styles.editProfileText, { color: colors.onBackground }]}>ADD GUARDIAN DETAILS</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Theme Settings Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="palette" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>THEME & APPEARANCE</Text>
          </View>
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
                  {isDarkMode ? 'Low-contrast high-efficiency mode' : 'High contrast daytime display'}
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

        {/* Account & Session Actions Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="security" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>ACCOUNT & SESSION SECURITY</Text>
          </View>

          <TouchableOpacity
            style={[styles.actionRowBtn, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}
            onPress={() => setShowSignOutModal(true)}
            activeOpacity={0.8}
          >
            <Icon name="logout" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionRowTitle, { color: colors.onBackground }]}>SIGN OUT SESSION</Text>
              <Text style={[styles.actionRowSub, { color: colors.onSurfaceVariant }]}>
                Signs out of Google/Firebase session and closes real-time socket channels.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRowBtn, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}
            onPress={() => setShowResetModal(true)}
            activeOpacity={0.8}
          >
            <Icon name="edit-note" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionRowTitle, { color: colors.onBackground }]}>ACCOUNT RESET & DELETION FORM</Text>
              <Text style={[styles.actionRowSub, { color: colors.onSurfaceVariant }]}>
                Fill out in-app form to reset profile data, erase telemetry records, or delete account.
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRowBtn, { backgroundColor: isDarkMode ? '#450A0A' : '#FEE2E2', borderColor: isDarkMode ? '#EF4444' : '#FCA5A5' }]}
            onPress={() => setShowDisconnectModal(true)}
            activeOpacity={0.8}
          >
            <Icon name="link-off" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionRowTitle, { color: isDarkMode ? '#FCA5A5' : '#DC2626' }]}>DISCONNECT ACCOUNT & WIPE DATA</Text>
              <Text style={[styles.actionRowSub, { color: isDarkMode ? '#F87171' : '#991B1B' }]}>
                Revokes OAuth access, clears encryption keys, guardian contacts & resets device credentials.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Deletion & Data Privacy Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: isDarkMode ? '#7F1D1D' : '#FCA5A5' }]}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="delete-forever" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FCA5A5' : '#DC2626' }]}>ACCOUNT DELETION & DATA PRIVACY</Text>
          </View>

          <Text style={[styles.actionRowSub, { color: colors.onSurfaceVariant, marginBottom: 2 }]}>
            Permanently delete your account, identity records, and telemetry data via the official deletion request form.
          </Text>

          <TouchableOpacity
            style={[styles.actionRowBtn, { backgroundColor: isDarkMode ? '#7F1D1D' : '#FEE2E2', borderColor: isDarkMode ? '#EF4444' : '#FCA5A5' }]}
            onPress={() => setShowResetModal(true)}
            activeOpacity={0.8}
          >
            <Icon name="assignment" size={22} color={isDarkMode ? '#FFFFFF' : colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionRowTitle, { color: isDarkMode ? '#FFFFFF' : '#DC2626' }]}>PERMANENT ACCOUNT DELETION FORM</Text>
              <Text style={[styles.actionRowSub, { color: isDarkMode ? '#FECDD3' : '#991B1B' }]}>
                Open the interactive Account Deletion & Data Removal request form.
              </Text>
            </View>
            <Icon name="open-in-new" size={18} color={isDarkMode ? '#FFFFFF' : colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <ProfileSetupModal
        visible={showProfileModal}
        onComplete={() => {
          setShowProfileModal(false);
          refreshAllProfileData();
        }}
      />

      {/* Sign Out Confirmation Modal */}
      <DialogueModal
        visible={showSignOutModal}
        title="Sign Out Session"
        message="Are you sure you want to sign out? Your session tokens will be cleared and active socket connections will close."
        iconName="logout"
        iconColor={colors.primary}
        onClose={() => setShowSignOutModal(false)}
        confirmText="Confirm Sign Out"
        onConfirm={handleSignOut}
        cancelText="Cancel"
      />

      {/* Disconnect Account Confirmation Modal */}
      <DialogueModal
        visible={showDisconnectModal}
        title="Disconnect Account & Wipe Data"
        message="WARNING: Disconnecting will revoke Google OAuth access, clear local guardian contacts, wipe cached encryption keys, and reset device credentials. Proceed?"
        iconName="warning"
        iconColor="#EF4444"
        onClose={() => setShowDisconnectModal(false)}
        confirmText="Wipe & Disconnect"
        onConfirm={handleDisconnect}
        cancelText="Cancel"
      />

      {/* Account Deletion Google Form Confirmation Modal */}
      <DialogueModal
        visible={showDeletionModal}
        title="Account Deletion Request"
        message="You will be redirected to the official Connify Account Deletion Google Form to complete your permanent account & data removal request."
        iconName="delete-forever"
        iconColor="#EF4444"
        onClose={() => setShowDeletionModal(false)}
        confirmText="Open Google Form"
        onConfirm={handleOpenDeletionForm}
        cancelText="Cancel"
      />

      {/* Interactive Account Deletion & Reset Form Modal */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Icon name="delete-forever" size={24} color="#EF4444" />
                <Text style={[styles.modalTitle, { color: colors.onBackground }]}>ACCOUNT DELETION & RESET FORM</Text>
              </View>
              <TouchableOpacity onPress={() => setShowResetModal(false)}>
                <Icon name="close" size={22} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSub, { color: colors.onSurfaceVariant }]}>
              Fill out this form to submit an account reset or permanent deletion request for your profile and telemetry data.
            </Text>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.onBackground }]}>ACCOUNT EMAIL / USER ID:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surfaceContainerHigh, color: colors.onBackground, borderColor: colors.outline }]}
                value={deletionEmail || profileEmail}
                onChangeText={setDeletionEmail}
                placeholder="Enter your account email"
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.onBackground }]}>REASON FOR DELETION / RESET:</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea, { backgroundColor: colors.surfaceContainerHigh, color: colors.onBackground, borderColor: colors.outline }]}
                value={deletionReason}
                onChangeText={setDeletionReason}
                placeholder="Please describe why you wish to delete or reset your account..."
                placeholderTextColor={colors.onSurfaceVariant}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={{ gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: '#DC2626' }]}
                onPress={handleConfirmDeletionSubmit}
                activeOpacity={0.8}
              >
                <Icon name="delete" size={18} color="#FFFFFF" />
                <Text style={styles.modalPrimaryBtnText}>SUBMIT DELETION FORM</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSecondaryBtn, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}
                onPress={handleOpenDeletionForm}
                activeOpacity={0.8}
              >
                <Icon name="open-in-new" size={18} color={colors.primary} />
                <Text style={[styles.modalSecondaryBtnText, { color: colors.onBackground }]}>OPEN OFFICIAL GOOGLE FORM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 15,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  container: {
    padding: 16,
    gap: 16,
  },
  profileCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
    fontWeight: '800',
  },
  profileTextGroup: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 19,
    fontWeight: '700',
  },
  profileSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 13,
    marginTop: 2,
  },
  editProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
  },
  editProfileText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11.5,
    letterSpacing: 0.8,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11.5,
    letterSpacing: 1.2,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  googleButtonText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
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
    borderRadius: 8,
    borderWidth: 1,
  },
  infoLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  infoValue: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 13,
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionRowTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  actionRowSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 14,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  modalSub: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  formGroup: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  modalInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'WorkSans-Regular',
    fontSize: 13,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalPrimaryBtnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  modalSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalSecondaryBtnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    letterSpacing: 0.8,
  },
});

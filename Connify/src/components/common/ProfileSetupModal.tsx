import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../../stores/authStore';
import { profileApi } from '../../services/api/profileApi';

interface ProfileSetupModalProps {
  visible: boolean;
  onComplete: () => void;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
const MEDICAL_CONDITIONS = [
  { id: 'asthma', label: '🫁 Asthma' },
  { id: 'diabetes', label: '🩸 Diabetes' },
  { id: 'penicillin', label: '💊 Penicillin Allergy' },
  { id: 'cardiac', label: '❤️ Heart Condition' },
  { id: 'food_allergy', label: '🥜 Severe Food Allergy' },
  { id: 'mobility', label: '🦯 Mobility Assist' },
];

export function ProfileSetupModal({ visible, onComplete }: ProfileSetupModalProps) {
  const { colors } = useTheme();
  const {
    userProfile,
    setProfileCompleted,
    signInWithGoogle,
  } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleInfoVisible, setGoogleInfoVisible] = useState(false);

  // Populate stored profile data when modal opens
  useEffect(() => {
    if (visible && userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setPhone(userProfile.phone || '');
      if (userProfile.medicalNotes) {
        try {
          const parsed = JSON.parse(userProfile.medicalNotes);
          if (parsed.bloodGroup) setBloodGroup(parsed.bloodGroup);
          if (parsed.conditions) setSelectedConditions(parsed.conditions);
        } catch {
          // If raw text
        }
      }
    }
  }, [visible, userProfile]);



  const toggleCondition = (condId: string) => {
    setSelectedConditions(prev =>
      prev.includes(condId) ? prev.filter(id => id !== condId) : [...prev, condId],
    );
  };



  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const medicalNotesFormatted = JSON.stringify({
        bloodGroup,
        conditions: selectedConditions,
      });
      const response = await profileApi.upsertProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        medicalNotes: medicalNotesFormatted,
      });
      if (response.success) {
        setProfileCompleted();
        onComplete();
      } else {
        setError(response.error?.message || 'Failed to save profile');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isDark = colors.background === '#050506';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surfaceContainerHigh,
              borderBottomColor: colors.outlineVariant,
            },
          ]}
        >
          <Icon name="verified-user" size={36} color={colors.primary} />
          <Text style={[styles.title, { color: colors.onSurface }]}>
            Register Emergency Profile
          </Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Your identity and medical emergency attributes are stored securely and only shared with
            verified responders.
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.formContainer, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Error banner */}
          {(error) && (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: colors.errorContainer, borderColor: colors.error },
              ]}
            >
              <Icon name="error-outline" size={20} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.onErrorContainer }]}>
                {error}
              </Text>
            </View>
          )}

          {/* ── Full Name ──────────────────────────────────────────────────── */}
          <View style={styles.rowGroup}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.onSurface }]}>First Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceContainerHigh,
                    borderColor: colors.outlineVariant,
                    color: colors.onSurface,
                  },
                ]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="e.g. Elena"
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.onSurface }]}>Last Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceContainerHigh,
                    borderColor: colors.outlineVariant,
                    color: colors.onSurface,
                  },
                ]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="e.g. Vance"
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>
          </View>

          {/* ── Phone ──────────────────────────────────── */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.onSurface }]}>
              Phone Number
            </Text>
            <View style={styles.phoneInputRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    flex: 1,
                    backgroundColor: colors.surfaceContainerHigh,
                    borderColor: colors.outlineVariant,
                    color: colors.onSurface,
                  },
                ]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 XXXXX XXXXX"
                keyboardType="phone-pad"
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>
            <Text style={[styles.inputHint, { color: colors.onSurfaceVariant }]}>
              Use E.164 format: +91XXXXXXXXXX · +1XXXXXXXXXX
            </Text>
          </View>

          {/* ── Blood Group ────────────────────────────────────────────────── */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.onSurface }]}>
              Blood Group Type (Radio Select)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.radioChipsRow}
            >
              {BLOOD_GROUPS.map(bg => {
                const isSelected = bloodGroup === bg;
                return (
                  <TouchableOpacity
                    key={bg}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.surfaceContainerHigh,
                        borderColor: isSelected ? colors.primary : colors.outlineVariant,
                      },
                    ]}
                    onPress={() => setBloodGroup(bg)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.onSurfaceVariant },
                      ]}
                    >
                      {bg}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Medical Conditions ─────────────────────────────────────────── */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.onSurface }]}>
              Medical Conditions & Allergies
            </Text>
            <View style={styles.checkboxGrid}>
              {MEDICAL_CONDITIONS.map(cond => {
                const isChecked = selectedConditions.includes(cond.id);
                return (
                  <TouchableOpacity
                    key={cond.id}
                    style={[
                      styles.checkboxTile,
                      {
                        backgroundColor: isChecked
                          ? colors.primaryContainer
                          : colors.surfaceContainerHigh,
                        borderColor: isChecked ? colors.primary : colors.outlineVariant,
                      },
                    ]}
                    onPress={() => toggleCondition(cond.id)}
                  >
                    <View
                      style={[
                        styles.checkboxBox,
                        {
                          borderColor: isChecked ? colors.primary : colors.onSurfaceVariant,
                          backgroundColor: isChecked ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {isChecked && <Icon name="check" size={12} color="#FFFFFF" />}
                    </View>
                    <Text
                      style={[
                        styles.checkboxText,
                        {
                          color: isChecked ? colors.onPrimaryContainer : colors.onSurfaceVariant,
                          fontFamily: isChecked ? 'WorkSans-Bold' : 'WorkSans-Regular',
                        },
                      ]}
                    >
                      {cond.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Google Sign-In ─────────────────────────────────────────────── */}
          <View
            style={[
              styles.accountAuthSection,
              { borderTopColor: colors.outlineVariant },
            ]}
          >
            <Text style={[styles.sectionHeader, { color: colors.onSurfaceVariant }]}>
              LINK ACCOUNT
            </Text>

            <TouchableOpacity
              style={[
                styles.googleButton,
                {
                  backgroundColor: colors.surfaceContainerHigh,
                  borderColor: colors.outlineVariant,
                },
              ]}
              onPress={async () => {
                setLoading(true);
                try {
                  await signInWithGoogle();
                } catch (e: any) {
                  setError(e.message || 'Failed to sign in with Google');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              <Icon name="g-mobiledata" size={26} color={colors.primary} />
              <Text style={[styles.googleButtonText, { color: colors.onSurface }]}>
                SIGN IN WITH GOOGLE
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ── Footer / Save ──────────────────────────────────────────────── */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.surfaceContainerHigh,
              borderTopColor: colors.outlineVariant,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              loading && styles.disabledOp,
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>SAVE PROFILE TO DATABASE</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    gap: 8,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    padding: 20,
    gap: 18,
    paddingBottom: 32,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  errorText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  inputHint: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 11,
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'WorkSans-Regular',
    fontSize: 14,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  verifyBadge: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledOp: {
    opacity: 0.65,
  },
  verifyBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  otpCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 8,
  },
  otpCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otpHint: {
    fontSize: 13,
    fontFamily: 'WorkSans-Bold',
  },
  otpSubHint: {
    fontSize: 12,
    fontFamily: 'WorkSans-Regular',
    lineHeight: 17,
  },
  verifyButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
  },
  radioChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkboxTile: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    fontSize: 12,
    flex: 1,
  },
  accountAuthSection: {
    marginTop: 8,
    gap: 10,
    borderTopWidth: 1,
    paddingTop: 14,
  },
  sectionHeader: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  googleButtonText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    letterSpacing: 0.8,
    flex: 1,
  },
  googleInfoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  googleInfoTitle: {
    fontFamily: 'WorkSans-Bold',
    fontSize: 13,
    marginBottom: 4,
  },
  googleInfoBody: {
    fontFamily: 'WorkSans-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  googleInfoDismiss: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 12,
    marginTop: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    letterSpacing: 1,
  },
});

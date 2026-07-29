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
import { theme } from '../../theme';
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
  const { userProfile, setProfileCompleted, signUpWithEmail, user } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Email / Account link state
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (selectedConditions.includes(condId)) {
      setSelectedConditions(selectedConditions.filter((id) => id !== condId));
    } else {
      setSelectedConditions([...selectedConditions, condId]);
    }
  };

  const handleSendOtp = () => {
    if (!phone.trim() || phone.length < 8) {
      setError('Please enter a valid phone number with country code');
      return;
    }
    setError(null);
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otpCode.trim() === '123456' || otpCode.length >= 4) {
      setPhoneVerified(true);
      setError(null);
    } else {
      setError('Invalid OTP code. Enter 123456 for demo verification.');
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build structured medical notes JSON string
      const medicalNotesFormatted = JSON.stringify({
        bloodGroup,
        conditions: selectedConditions,
        verifiedPhone: phoneVerified ? phone : null,
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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Icon name="verified-user" size={36} color={theme.colors.primary} />
          <Text style={styles.title}>Register Emergency Profile</Text>
          <Text style={styles.subtitle}>
            Your identity and medical emergency attributes are stored securely and only shared with verified responders.
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={20} color={theme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Full Name */}
          <View style={styles.rowGroup}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="e.g. Elena"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="e.g. Vance"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
            </View>
          </View>

          {/* Phone Number & OTP Verification */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number (OTP Verification)</Text>
            <View style={styles.phoneInputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 555-0198"
                keyboardType="phone-pad"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
              <TouchableOpacity
                style={[styles.verifyBadge, phoneVerified && styles.verifiedBadge]}
                onPress={handleSendOtp}
                disabled={phoneVerified}
              >
                <Text style={styles.verifyBadgeText}>
                  {phoneVerified ? 'VERIFIED ✓' : otpSent ? 'RESEND OTP' : 'SEND OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {otpSent && !phoneVerified && (
            <View style={styles.otpCard}>
              <Text style={styles.otpHint}>Enter OTP Code (Use 123456 for demo):</Text>
              <View style={styles.phoneInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  placeholder="123456"
                  keyboardType="number-pad"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                />
                <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOtp}>
                  <Text style={styles.verifyButtonText}>VERIFY</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Medical Data — Blood Group (Radio Choice) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Blood Group Type (Radio Select)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.radioChipsRow}>
              {BLOOD_GROUPS.map((bg) => {
                const isSelected = bloodGroup === bg;
                return (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setBloodGroup(bg)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {bg}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Medical Data — Conditions & Allergies (Checkbox Choice) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medical Conditions & Allergies (Checkboxes)</Text>
            <View style={styles.checkboxGrid}>
              {MEDICAL_CONDITIONS.map((cond) => {
                const isChecked = selectedConditions.includes(cond.id);
                return (
                  <TouchableOpacity
                    key={cond.id}
                    style={[styles.checkboxTile, isChecked && styles.checkboxTileChecked]}
                    onPress={() => toggleCondition(cond.id)}
                  >
                    <View style={[styles.checkboxBox, isChecked && styles.checkboxBoxChecked]}>
                      {isChecked && <Icon name="check" size={12} color="#FFFFFF" />}
                    </View>
                    <Text style={[styles.checkboxText, isChecked && styles.checkboxTextChecked]}>
                      {cond.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Account Authentication Options */}
          <View style={styles.accountAuthSection}>
            <Text style={styles.sectionHeader}>Link Account (Google / Email)</Text>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => setError('Google Sign-In ready for native build.')}
            >
              <Icon name="g-mobiledata" size={26} color="#FFFFFF" />
              <Text style={styles.googleButtonText}>SIGN IN WITH GOOGLE</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
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
    backgroundColor: '#050506',
  },
  header: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0E1320',
  },
  title: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 22,
    color: '#FFFFFF',
    marginTop: 12,
  },
  subtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  formContainer: {
    padding: 20,
    gap: 18,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  errorText: {
    color: '#FCA5A5',
    fontFamily: theme.fontFamilies.technical.medium,
    fontSize: 12,
    flex: 1,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#161C2E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  verifyBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
  },
  verifyBadgeText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  otpCard: {
    backgroundColor: '#161C2E',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  otpHint: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: theme.fontFamilies.secondary.regular,
  },
  verifyButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
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
    backgroundColor: '#161C2E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipSelected: {
    backgroundColor: '#DC2626',
    borderColor: '#EF4444',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  chipText: {
    fontSize: 13,
    fontFamily: theme.fontFamilies.technical.bold,
    color: '#94A3B8',
  },
  chipTextSelected: {
    color: '#FFFFFF',
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
    backgroundColor: '#161C2E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  checkboxTileChecked: {
    borderColor: '#DC2626',
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    borderColor: '#DC2626',
    backgroundColor: '#DC2626',
  },
  checkboxText: {
    fontSize: 12,
    fontFamily: theme.fontFamilies.secondary.regular,
    color: '#94A3B8',
    flex: 1,
  },
  checkboxTextChecked: {
    fontFamily: theme.fontFamilies.secondary.bold,
    color: '#FFFFFF',
  },
  accountAuthSection: {
    marginTop: 8,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 14,
  },
  sectionHeader: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E2638',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0E1320',
  },
  button: {
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    letterSpacing: 1,
  },
});

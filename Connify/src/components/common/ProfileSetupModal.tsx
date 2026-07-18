import React, { useState } from 'react';
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

export function ProfileSetupModal({ visible, onComplete }: ProfileSetupModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setProfileCompleted } = useAuthStore();

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await profileApi.upsertProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        medicalNotes: medicalNotes.trim() || undefined,
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
          <Icon name="verified-user" size={32} color={theme.colors.primary} />
          <Text style={styles.title}>Glad you're safe!</Text>
          <Text style={styles.subtitle}>
            Please complete your trusted profile to help responders identify you during emergencies.
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={20} color={theme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="e.g. Elena"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="e.g. Vance"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number (Optional)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 555-0198"
              keyboardType="phone-pad"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medical Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={medicalNotes}
              onChangeText={setMedicalNotes}
              placeholder="e.g. Type O- Blood, Penicillin allergy"
              multiline
              numberOfLines={3}
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
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
              <Text style={styles.buttonText}>SAVE PROFILE</Text>
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
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  title: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 24,
    color: theme.colors.onBackground,
    marginTop: 16,
  },
  subtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  formContainer: {
    padding: 24,
    gap: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.errorContainer,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: theme.colors.onErrorContainer,
    fontFamily: theme.fontFamilies.technical.medium,
    fontSize: 12,
    flex: 1,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: theme.colors.onSurface,
  },
  input: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: 8,
    padding: 14,
    color: theme.colors.onBackground,
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.background,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.colors.onPrimary,
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    letterSpacing: 1,
  },
});

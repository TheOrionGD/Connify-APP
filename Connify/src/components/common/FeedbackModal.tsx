import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';

interface FeedbackModalProps {
  visible: boolean;
  onComplete: () => void;
}

export function FeedbackModal({ visible, onComplete }: FeedbackModalProps) {
  const [assistanceStatus, setAssistanceStatus] = useState<'resolved' | 'in_progress' | 'unresolved'>('resolved');
  const [responseSpeed, setResponseSpeed] = useState<'fast' | 'moderate' | 'slow'>('fast');
  const [safetyNeeds, setSafetyNeeds] = useState<string[]>(['safe']);
  const [loading, setLoading] = useState(false);

  const toggleSafetyNeed = (need: string) => {
    if (safetyNeeds.includes(need)) {
      setSafetyNeeds(safetyNeeds.filter((item) => item !== need));
    } else {
      setSafetyNeeds([...safetyNeeds, need]);
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 400);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Icon name="check-circle-outline" size={36} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>Emergency Help Completed</Text>
            <Text style={styles.subtitle}>
              Please provide quick feedback on your emergency response experience to keep our community safe.
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* Question 1: Assistance Outcome */}
            <View style={styles.section}>
              <Text style={styles.questionLabel}>1. Was your emergency request resolved?</Text>
              <View style={styles.optionsGroup}>
                {[
                  { key: 'resolved', label: '✅ Resolved & Safe' },
                  { key: 'in_progress', label: '⏳ In Progress' },
                  { key: 'unresolved', label: '❌ Unresolved / Canceled' },
                ].map((item) => {
                  const isSelected = assistanceStatus === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.radioTile, isSelected && styles.radioTileSelected]}
                      onPress={() => setAssistanceStatus(item.key as any)}
                    >
                      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.tileText, isSelected && styles.tileTextSelected]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Question 2: Response Speed */}
            <View style={styles.section}>
              <Text style={styles.questionLabel}>2. How fast was the volunteer responder?</Text>
              <View style={styles.optionsGroup}>
                {[
                  { key: 'fast', label: '🚀 Rapid Response (< 5 min)' },
                  { key: 'moderate', label: '⏱️ Moderate Response' },
                  { key: 'slow', label: '🐢 Slow Response' },
                ].map((item) => {
                  const isSelected = responseSpeed === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.radioTile, isSelected && styles.radioTileSelected]}
                      onPress={() => setResponseSpeed(item.key as any)}
                    >
                      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.tileText, isSelected && styles.tileTextSelected]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Question 3: Current Safety Status */}
            <View style={styles.section}>
              <Text style={styles.questionLabel}>3. Current Safety & Follow-up Needs:</Text>
              <View style={styles.checkboxGrid}>
                {[
                  { key: 'safe', label: 'I am safe and secure' },
                  { key: 'medical_check', label: 'Need medical checkup' },
                  { key: 'contact_family', label: 'Notify emergency contact' },
                  { key: 'authorities', label: 'Contact local emergency services' },
                ].map((item) => {
                  const isChecked = safetyNeeds.includes(item.key);
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.checkboxTile, isChecked && styles.checkboxTileChecked]}
                      onPress={() => toggleSafetyNeed(item.key)}
                    >
                      <View style={[styles.checkboxBox, isChecked && styles.checkboxBoxChecked]}>
                        {isChecked && <Icon name="check" size={14} color="#FFFFFF" />}
                      </View>
                      <Text style={[styles.tileText, isChecked && styles.tileTextSelected]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <View style={styles.buttonRow}>
                  <Text style={styles.submitButtonText}>SUBMIT & SETUP USER PROFILE</Text>
                  <Icon name="arrow-forward" size={18} color={theme.colors.onPrimary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 20,
    color: theme.colors.onBackground,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  formContainer: {
    padding: 20,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  questionLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: theme.colors.onBackground,
  },
  optionsGroup: {
    gap: 8,
  },
  radioTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  radioTileSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.onSurfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  checkboxGrid: {
    gap: 8,
  },
  checkboxTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  checkboxTileChecked: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.onSurfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  tileText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
    color: theme.colors.onSurface,
    flex: 1,
  },
  tileTextSelected: {
    fontFamily: theme.fontFamilies.secondary.bold,
    color: theme.colors.onBackground,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.background,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: theme.colors.onPrimary,
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    letterSpacing: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

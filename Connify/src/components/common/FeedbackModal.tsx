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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0E1320',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderWidth: 1,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
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
    gap: 20,
  },
  section: {
    gap: 10,
  },
  questionLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  optionsGroup: {
    gap: 8,
  },
  radioTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161C2E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  radioTileSelected: {
    borderColor: '#DC2626',
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#DC2626',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  checkboxGrid: {
    gap: 8,
  },
  checkboxTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161C2E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  checkboxTileChecked: {
    borderColor: '#DC2626',
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    borderColor: '#DC2626',
    backgroundColor: '#DC2626',
  },
  tileText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
    color: '#94A3B8',
    flex: 1,
  },
  tileTextSelected: {
    fontFamily: theme.fontFamilies.secondary.bold,
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0E1320',
  },
  submitButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    letterSpacing: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

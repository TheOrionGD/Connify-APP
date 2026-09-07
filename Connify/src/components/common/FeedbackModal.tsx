import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, useTheme } from '../../theme';

interface FeedbackModalProps {
  visible: boolean;
  onComplete: () => void;
}

export function FeedbackModal({ visible, onComplete }: FeedbackModalProps) {
  const { colors } = useTheme();
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
        <View style={[styles.modalCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={[styles.header, { borderBottomColor: colors.outline }]}>
            <View style={styles.iconCircle}>
              <Icon name="check-circle-outline" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.onBackground }]}>Emergency Help Completed</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              Please verify your distress status to finalize and revoke zero-trace P2P telemetry tokens.
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* Question 1: Resolution Status */}
            <View style={styles.section}>
              <Text style={[styles.questionLabel, { color: colors.onBackground }]}>1. WAS YOUR EMERGENCY RESOLVED?</Text>
              <View style={styles.optionsGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioTile,
                    { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline },
                    assistanceStatus === 'resolved' && styles.radioTileSelected,
                  ]}
                  onPress={() => setAssistanceStatus('resolved')}
                >
                  <View style={[styles.radioOuter, assistanceStatus === 'resolved' && styles.radioOuterSelected]}>
                    {assistanceStatus === 'resolved' && <View style={styles.radioInner} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tileTitle, { color: colors.onBackground }]}>Yes — Fully Safe & Assisted</Text>
                    <Text style={[styles.tileSub, { color: colors.onSurfaceVariant }]}>Responders arrived or situation de-escalated safely.</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioTile,
                    { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline },
                    assistanceStatus === 'in_progress' && styles.radioTileSelected,
                  ]}
                  onPress={() => setAssistanceStatus('in_progress')}
                >
                  <View style={[styles.radioOuter, assistanceStatus === 'in_progress' && styles.radioOuterSelected]}>
                    {assistanceStatus === 'in_progress' && <View style={styles.radioInner} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tileTitle, { color: colors.onBackground }]}>Ongoing — Safe Location Reached</Text>
                    <Text style={[styles.tileSub, { color: colors.onSurfaceVariant }]}>En route to hospital / station with escort.</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioTile,
                    { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline },
                    assistanceStatus === 'unresolved' && styles.radioTileSelected,
                  ]}
                  onPress={() => setAssistanceStatus('unresolved')}
                >
                  <View style={[styles.radioOuter, assistanceStatus === 'unresolved' && styles.radioOuterSelected]}>
                    {assistanceStatus === 'unresolved' && <View style={styles.radioInner} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tileTitle, { color: colors.onBackground }]}>No — Required Authorities</Text>
                    <Text style={[styles.tileSub, { color: colors.onSurfaceVariant }]}>Escalated to 112 / Police emergency dispatch.</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Question 2: Response Speed */}
            <View style={styles.section}>
              <Text style={[styles.questionLabel, { color: colors.onBackground }]}>2. P2P MESH RESPONSE TIME</Text>
              <View style={styles.optionsGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioTile,
                    { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline },
                    responseSpeed === 'fast' && styles.radioTileSelected,
                  ]}
                  onPress={() => setResponseSpeed('fast')}
                >
                  <View style={[styles.radioOuter, responseSpeed === 'fast' && styles.radioOuterSelected]}>
                    {responseSpeed === 'fast' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.tileTitle, { color: colors.onBackground }]}>Immediate (&lt; 3 mins)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioTile,
                    { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline },
                    responseSpeed === 'moderate' && styles.radioTileSelected,
                  ]}
                  onPress={() => setResponseSpeed('moderate')}
                >
                  <View style={[styles.radioOuter, responseSpeed === 'moderate' && styles.radioOuterSelected]}>
                    {responseSpeed === 'moderate' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.tileTitle, { color: colors.onBackground }]}>Standard (3 - 10 mins)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioTile,
                    { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline },
                    responseSpeed === 'slow' && styles.radioTileSelected,
                  ]}
                  onPress={() => setResponseSpeed('slow')}
                >
                  <View style={[styles.radioOuter, responseSpeed === 'slow' && styles.radioOuterSelected]}>
                    {responseSpeed === 'slow' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.tileTitle, { color: colors.onBackground }]}>Delayed (&gt; 10 mins)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Question 3: Follow-up Needs */}
            <View style={styles.section}>
              <Text style={[styles.questionLabel, { color: colors.onBackground }]}>3. FOLLOW-UP ASSISTANCE NEEDED?</Text>
              <View style={styles.checkboxGrid}>
                <TouchableOpacity
                  style={[
                    styles.checkboxTile,
                    { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline },
                    safetyNeeds.includes('safe') && styles.checkboxTileChecked,
                  ]}
                  onPress={() => toggleSafetyNeed('safe')}
                >
                  <Icon
                    name={safetyNeeds.includes('safe') ? 'check-box' : 'check-box-outline-blank'}
                    size={20}
                    color={safetyNeeds.includes('safe') ? '#DC2626' : colors.onSurfaceVariant}
                  />
                  <Text style={[styles.tileTitle, { color: colors.onBackground }]}>None — I am in a secure environment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.checkboxTile,
                    { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline },
                    safetyNeeds.includes('medical') && styles.checkboxTileChecked,
                  ]}
                  onPress={() => toggleSafetyNeed('medical')}
                >
                  <Icon
                    name={safetyNeeds.includes('medical') ? 'check-box' : 'check-box-outline-blank'}
                    size={20}
                    color={safetyNeeds.includes('medical') ? '#DC2626' : colors.onSurfaceVariant}
                  />
                  <Text style={[styles.tileTitle, { color: colors.onBackground }]}>Medical checkup &amp; first-aid dispatch</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.checkboxTile,
                    { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline },
                    safetyNeeds.includes('guardian') && styles.checkboxTileChecked,
                  ]}
                  onPress={() => toggleSafetyNeed('guardian')}
                >
                  <Icon
                    name={safetyNeeds.includes('guardian') ? 'check-box' : 'check-box-outline-blank'}
                    size={20}
                    color={safetyNeeds.includes('guardian') ? '#DC2626' : colors.onSurfaceVariant}
                  />
                  <Text style={[styles.tileTitle, { color: colors.onBackground }]}>Notify primary emergency guardians via SMS</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>FINALIZE &amp; CLOSE SESSION</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
    borderWidth: 1,
  },
  header: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
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
    letterSpacing: 0.5,
  },
  optionsGroup: {
    gap: 8,
  },
  radioTile: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  radioTileSelected: {
    borderColor: '#DC2626',
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
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
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  checkboxTileChecked: {
    borderColor: '#DC2626',
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
  },
  tileTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 14,
  },
  tileSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 11.5,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    letterSpacing: 1,
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
  },
  submitButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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

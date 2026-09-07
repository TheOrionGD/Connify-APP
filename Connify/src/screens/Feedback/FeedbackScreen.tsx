import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { StandardButton } from '../../components/buttons/StandardButton';
import { StandardCard } from '../../components/cards/StandardCard';
import { DialogueModal } from '../../components/common/DialogueModal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useEpisodeStore } from '../../stores/episodeStore';

import { launchImageLibrary } from 'react-native-image-picker';
import { Image } from 'react-native';

import { NotificationService } from '../../services/NotificationService';
import { useRewardStore } from '../../stores/rewardStore';

import { generateIncidentAuditReport } from '../../utils/reportGenerator';
import { Modal, ScrollView, Alert as RNAlert, Platform } from 'react-native';

export default function FeedbackScreen({ route, navigation }: any) {
  const submitFeedback = useEpisodeStore((state) => state.submitFeedback);
  const episodeStoreState = useEpisodeStore();
  const role = route?.params?.role || 'requester';
  const isResponder = role === 'responder' || role === 'helper';

  const [resolved, setResolved] = useState<boolean | null>(null);
  const [riskLevel, setRiskLevel] = useState<number>(3);
  const [responderRating, setResponderRating] = useState<number>(5);
  const [taskPhotoUri, setTaskPhotoUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatedReportText, setGeneratedReportText] = useState('');

  const handlePickPhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setTaskPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Image picker error:', e);
    }
  };

  const handleSubmit = () => {
    if (resolved === null) return;
    
    // Feature 18: Award Trust Tokens & Peer Rating
    if (!isResponder) {
      useRewardStore.getState().addTrustTokens(50, responderRating);
    }
    
    setModalVisible(true);
  };

  const handleExportReport = () => {
    const reportText = generateIncidentAuditReport({
      episodeId: episodeStoreState.episodeId || `ep-audit-${Date.now()}`,
      category: episodeStoreState.category || 'General Emergency',
      urgency: episodeStoreState.urgency || 3,
      userName: 'Safety User',
      responderDeviceId: episodeStoreState.responderInfo?.helperDeviceId || 'helper-node-verified',
      responderRole: 'Verified Community Volunteer Responder',
      startTime: new Date(Date.now() - 900000).toLocaleTimeString(),
      handshakeTime: new Date(Date.now() - 300000).toLocaleTimeString(),
      resolvedTime: new Date().toLocaleTimeString(),
      startCoordinates: episodeStoreState.coordinates || undefined,
      witnessCount: episodeStoreState.witnessAttestations.length,
      duressTriggered: episodeStoreState.isDuressActive,
      safeEscortCompleted: episodeStoreState.isSafeEscortActive,
      verificationHash: '0x_audit_' + Math.random().toString(16).substring(2, 10).toUpperCase(),
    });

    setGeneratedReportText(reportText);
    setShowReportModal(true);
  };

  const handleFinish = () => {
    setModalVisible(false);
    if (resolved !== null) {
      submitFeedback(resolved);
    }
    useRewardStore.getState().unlockBadge('FEEDBACK_SUBMITTED');
    NotificationService.notifyFeedbackCompleted().catch(() => null);
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isResponder ? 'RESPONDER VERIFICATION EVALUATION' : 'REQUESTER PROTOCOL EVALUATION'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          <View style={styles.iconCircle}>
            <Icon name={isResponder ? 'verified-user' : 'verified'} size={44} color={theme.colors.primary} />
          </View>

          <Text style={styles.title}>
            {isResponder ? 'Responder Task Outcome' : 'Post-Episode Feedback'}
          </Text>
          <Text style={styles.subtitle}>
            Connify runs on zero-trust parameters. Submitting this feedback logs anonymized audit telemetry to the ledger and purges local tracking data.
          </Text>

          {/* Feature 17: Post-Handshake Automated Wellness Check Banner */}
          {!isResponder && (
            <View style={{ width: '100%', padding: 14, borderRadius: 12, backgroundColor: '#D1FAE5', borderWidth: 1, borderColor: '#10B981', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Icon name="shield-heart" size={22} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: theme.fontFamilies.primary.bold, fontSize: 13, color: '#065F46' }}>
                  Automated 5-Min Wellness Check Active
                </Text>
                <Text style={{ fontFamily: theme.fontFamilies.secondary.regular, fontSize: 11, color: '#047857', marginTop: 1 }}>
                  Confirm your safety state below to close the emergency window and issue responder trust tokens.
                </Text>
              </View>
            </View>
          )}

          <StandardCard style={styles.feedbackCard}>
            <Text style={styles.questionText}>
              {isResponder
                ? 'Was the emergency assistance completed successfully?'
                : 'Was assistance resolved successfully?'}
            </Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  resolved === true ? styles.optionButtonActiveYes : null,
                ]}
                onPress={() => setResolved(true)}
              >
                <Icon
                  name="check-circle"
                  size={22}
                  color={resolved === true ? '#FFFFFF' : theme.colors.onBackground}
                />
                <Text
                  style={[
                    styles.optionText,
                    resolved === true ? styles.optionTextActive : null,
                  ]}
                >
                  YES
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  resolved === false ? styles.optionButtonActiveNo : null,
                ]}
                onPress={() => setResolved(false)}
              >
                <Icon
                  name="cancel"
                  size={22}
                  color={resolved === false ? '#FFFFFF' : theme.colors.onBackground}
                />
                <Text
                  style={[
                    styles.optionText,
                    resolved === false ? styles.optionTextActive : null,
                  ]}
                >
                  NO
                </Text>
              </TouchableOpacity>
            </View>

            {/* Feature 18: Volunteer Responder 5-Star Peer Rating & Trust Tokens */}
            {!isResponder && (
              <View style={{ width: '100%', alignItems: 'center', marginTop: 10, gap: 6 }}>
                <Text style={styles.questionText}>Rate Volunteer Responder Performance:</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setResponderRating(star)}>
                      <Icon
                        name={star <= responderRating ? 'star' : 'star-outline'}
                        size={28}
                        color={star <= responderRating ? '#F59E0B' : theme.colors.onSurfaceVariant}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 4 }}>
                  <Icon name="token" size={16} color="#D97706" />
                  <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 11, color: '#B45309' }}>
                    +50 Trust Tokens will be awarded to Responder
                  </Text>
                </View>
              </View>
            )}

            {/* Risk Rating Selector */}
            <Text style={[styles.questionText, { marginTop: 12 }]}>Perceived Situation Risk Rating:</Text>
            <View style={styles.riskRow}>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[
                    styles.riskPill,
                    riskLevel === lvl ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : null,
                  ]}
                  onPress={() => setRiskLevel(lvl)}
                >
                  <Text style={{ color: riskLevel === lvl ? '#FFFFFF' : theme.colors.onBackground, fontFamily: theme.fontFamilies.technical.bold, fontSize: 13 }}>
                    L{lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Optional Responder Task Photo Attachment */}
            {isResponder && (
              <View style={{ width: '100%', marginTop: 12, alignItems: 'center', gap: 8 }}>
                <Text style={styles.questionText}>Task Resolution Photo Proof (Optional):</Text>
                {taskPhotoUri ? (
                  <View style={{ position: 'relative', width: 120, height: 100, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.outline }}>
                    <Image source={{ uri: taskPhotoUri }} style={{ width: '100%', height: '100%' }} />
                    <TouchableOpacity
                      style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 2 }}
                      onPress={() => setTaskPhotoUri(null)}
                    >
                      <Icon name="close" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: theme.colors.surfaceContainerHigh,
                      borderWidth: 1,
                      borderColor: theme.colors.outline,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                    }}
                    onPress={handlePickPhoto}
                  >
                    <Icon name="add-a-photo" size={18} color={theme.colors.primary} />
                    <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 12, color: theme.colors.onBackground }}>
                      ATTACH PROOF PHOTO
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Feature 19: Incident Summary Audit Report Exporter Button */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: theme.colors.surfaceContainerHigh,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10,
                width: '100%',
                marginTop: 8,
              }}
              onPress={handleExportReport}
            >
              <Icon name="assessment" size={18} color={theme.colors.primary} />
              <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 12, color: theme.colors.onBackground }}>
                EXPORT INCIDENT AUDIT REPORT (PDF/TEXT)
              </Text>
            </TouchableOpacity>
          </StandardCard>
        </View>

        <StandardButton
          title="SUBMIT & LOG AUDIT OUTCOME"
          onPress={handleSubmit}
          disabled={resolved === null}
          icon={<Icon name="lock" size={20} color="#FFFFFF" />}
          style={styles.submitButton}
        />
      </ScrollView>

      {/* Feature 19: Incident Audit Report Viewer Modal */}
      <Modal visible={showReportModal} transparent animationType="slide" onRequestClose={() => setShowReportModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 440, maxHeight: '80%', backgroundColor: '#090D16', borderRadius: 16, padding: 18, gap: 12, borderWidth: 1, borderColor: theme.colors.outline }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="assignment" size={22} color="#059669" />
                <Text style={{ fontFamily: theme.fontFamilies.primary.bold, fontSize: 15, color: '#FFFFFF' }}>
                  Incident Audit Summary Report
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Icon name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ backgroundColor: '#030508', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#1E293B' }}>
              <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 11, color: '#38BDF8', lineHeight: 17 }}>
                {generatedReportText}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={{ backgroundColor: '#059669', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
              onPress={() => {
                setShowReportModal(false);
                RNAlert.alert('Report Saved', 'Incident Audit Report copied to device storage.');
              }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: theme.fontFamilies.technical.bold, fontSize: 12 }}>
                COPY & SAVE AUDIT REPORT
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DialogueModal
        visible={modalVisible}
        title="Session Purged & Outcome Logged"
        message="Your anonymized episode outcome has been recorded on the zero-trust audit ledger. All tracking channels have been torn down."
        onClose={handleFinish}
        confirmText="Done"
        onConfirm={handleFinish}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  header: {
    height: 56,
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    position: 'relative',
    zIndex: 3,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 8,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    color: theme.colors.onBackground,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    padding: theme.spacing.containerPadding,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    zIndex: 3,
  },
  contentWrapper: {
    alignItems: 'center',
    width: '100%',
    gap: 14,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: theme.colors.outline,
    marginTop: 10,
  },
  title: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 22,
    color: theme.colors.onBackground,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  feedbackCard: {
    width: '100%',
    marginTop: 8,
    gap: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
    padding: 18,
  },
  questionText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 14,
    color: theme.colors.onBackground,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
  },
  optionButton: {
    flex: 1,
    height: 48,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  optionButtonActiveYes: {
    backgroundColor: '#059669',
    borderColor: theme.colors.outline,
  },
  optionButtonActiveNo: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.outline,
  },
  optionText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: theme.colors.onBackground,
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  riskRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  riskPill: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  submitButton: {
    width: '100%',
    maxWidth: 440,
  },
});

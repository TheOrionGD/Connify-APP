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

export default function FeedbackScreen({ navigation }: any) {
  const submitFeedback = useEpisodeStore((state) => state.submitFeedback);
  const [resolved, setResolved] = useState<boolean | null>(null);
  const [riskLevel, setRiskLevel] = useState<number>(3);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSubmit = () => {
    if (resolved === null) return;
    setModalVisible(true);
  };

  const handleFinish = () => {
    setModalVisible(false);
    if (resolved !== null) {
      submitFeedback(resolved);
    }
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROTOCOL EVALUATION</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <View style={styles.iconCircle}>
            <Icon name="verified" size={44} color={theme.colors.primary} />
          </View>

          <Text style={styles.title}>Post-Episode Feedback</Text>
          <Text style={styles.subtitle}>
            Connify runs on zero-trust parameters. Submitting this feedback logs the anonymized outcome to the audit ledger and purges all local tracking traces.
          </Text>

          <StandardCard style={styles.feedbackCard}>
            <Text style={styles.questionText}>Was assistance resolved successfully?</Text>
            
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
          </StandardCard>
        </View>

        <StandardButton
          title="SUBMIT & LOG AUDIT OUTCOME"
          onPress={handleSubmit}
          disabled={resolved === null}
          icon={<Icon name="lock" size={20} color="#FFFFFF" />}
          style={styles.submitButton}
        />
      </View>

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
  },
  header: {
    height: 56,
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    position: 'relative',
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

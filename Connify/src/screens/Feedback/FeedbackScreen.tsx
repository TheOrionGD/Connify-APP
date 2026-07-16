import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme';
import { StandardButton } from '../../components/buttons/StandardButton';
import { StandardCard } from '../../components/cards/StandardCard';
import { DialogueModal } from '../../components/common/DialogueModal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useEpisodeStore } from '../../stores/episodeStore';

export default function FeedbackScreen({ navigation }: any) {
  const submitFeedback = useEpisodeStore((state) => state.submitFeedback);
  const [resolved, setResolved] = useState<boolean | null>(null);
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
      {/* Centered AppBar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Protocol Evaluation</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Hero Explainer Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Icon name="volunteer-activism" size={44} color={theme.colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>Post-Episode Feedback</Text>
          <Text style={styles.subtitle}>
            Connify runs on zero-trust parameters. Submitting this feedback purges all ephemeral local coordinates, tracking traces, and active tokens from your device storage.
          </Text>

          {/* Binary Choice Card */}
          <StandardCard style={styles.feedbackCard}>
            <Text style={styles.questionText}>Was help resolved successfully?</Text>
            
            <View style={styles.optionsContainer}>
              {/* YES Option */}
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  resolved === true ? styles.optionButtonActiveYes : null,
                ]}
                onPress={() => setResolved(true)}
              >
                <Icon
                  name="check-circle"
                  size={24}
                  color={resolved === true ? '#ffffff' : theme.colors.secondary}
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

              {/* NO Option */}
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  resolved === false ? styles.optionButtonActiveNo : null,
                ]}
                onPress={() => setResolved(false)}
              >
                <Icon
                  name="cancel"
                  size={24}
                  color={resolved === false ? '#ffffff' : theme.colors.secondary}
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
          </StandardCard>
        </View>

        {/* Submit & Purge CTA */}
        <StandardButton
          title="SUBMIT & CLOSE EPISODE"
          onPress={handleSubmit}
          disabled={resolved === null}
          icon={<Icon name="lock" size={20} color={theme.colors.onPrimary} />}
          style={styles.submitButton}
        />
      </View>

      {/* Confirmation purge modal */}
      <DialogueModal
        visible={modalVisible}
        title="Logs Purged Successfully"
        message="All ephemeral tracking data, WebSocket sessions, and Trust Capsule credentials have been wiped from device local storage."
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
    height: 64,
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    padding: theme.spacing.containerPadding,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 32,
  },
  contentWrapper: {
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  iconContainer: {
    marginTop: 20,
    marginBottom: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryFixed,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outlineVariant,
  },
  title: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 24,
    color: theme.colors.onBackground,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  feedbackCard: {
    width: '100%',
    marginTop: 16,
    gap: 16,
    alignItems: 'center',
  },
  questionText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 16,
    color: theme.colors.onBackground,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  optionButton: {
    flex: 1,
    height: 52,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.onBackground,
    borderRadius: theme.spacing.radiusDefault,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  optionButtonActiveYes: {
    backgroundColor: '#388e3c', // Green confirmation
    borderColor: '#388e3c',
  },
  optionButtonActiveNo: {
    backgroundColor: theme.colors.primary, // Red cancellation
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    color: theme.colors.secondary,
  },
  optionTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    width: '100%',
    maxWidth: 440,
  },
});

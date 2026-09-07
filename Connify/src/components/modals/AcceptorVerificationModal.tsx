import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, useTheme } from '../../theme';

export type AcceptorVerificationStep = 'idle' | 'challenge' | 'capsule' | 'success' | 'failed';

interface AcceptorVerificationModalProps {
  visible: boolean;
  step: AcceptorVerificationStep;
  errorMessage?: string;
  onRetry?: () => void;
  onClose: () => void;
}

export const AcceptorVerificationModal: React.FC<AcceptorVerificationModalProps> = ({
  visible,
  step,
  errorMessage,
  onRetry,
  onClose,
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={[styles.cardContainer, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.header}>
            <Icon
              name={step === 'failed' ? 'error-outline' : step === 'success' ? 'verified' : 'security'}
              size={32}
              color={step === 'failed' ? '#EF4444' : step === 'success' ? '#10B981' : '#38BDF8'}
            />
            <Text style={[styles.title, { color: colors.onBackground }]}>RESPONDER SECURITY VERIFICATION</Text>
          </View>

          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Symmetric Zero-Trust Protocol Handshake
          </Text>

          <View style={styles.stepsContainer}>
            {/* Step 1: 60s Server Challenge Nonce */}
            <View style={[styles.stepRow, { backgroundColor: colors.surfaceContainerHigh }]}>
              {step === 'challenge' ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : step === 'capsule' || step === 'success' ? (
                <Icon name="check-circle" size={20} color="#10B981" />
              ) : (
                <Icon name="radio-button-unchecked" size={20} color={colors.onSurfaceVariant} />
              )}
              <Text style={[styles.stepText, { color: colors.onBackground }]}>1. Cryptographic Challenge Nonce</Text>
            </View>

            {/* Step 2: Ephemeral Trust Capsule Issuance */}
            <View style={[styles.stepRow, { backgroundColor: colors.surfaceContainerHigh }]}>
              {step === 'capsule' ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : step === 'success' ? (
                <Icon name="check-circle" size={20} color="#10B981" />
              ) : (
                <Icon name="radio-button-unchecked" size={20} color={colors.onSurfaceVariant} />
              )}
              <Text style={[styles.stepText, { color: colors.onBackground }]}>2. Issue Ephemeral Trust Capsule</Text>
            </View>

            {/* Step 3: Zero-Trace P2P Encryption Channel */}
            <View style={[styles.stepRow, { backgroundColor: colors.surfaceContainerHigh }]}>
              {step === 'success' ? (
                <Icon name="check-circle" size={20} color="#10B981" />
              ) : (
                <Icon name="radio-button-unchecked" size={20} color={colors.onSurfaceVariant} />
              )}
              <Text style={[styles.stepText, { color: colors.onBackground }]}>3. P2P Direct Mesh Active</Text>
            </View>
          </View>

          {step === 'failed' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>VERIFICATION FAILED</Text>
              <Text style={styles.errorMessage}>{errorMessage || 'Handshake failed'}</Text>
            </View>
          )}

          <View style={styles.actionsRow}>
            {step === 'failed' && onRetry && (
              <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]} onPress={onRetry}>
                <Text style={[styles.retryBtnText, { color: colors.onBackground }]}>RETRY HANDSHAKE</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.closeBtn, step === 'success' ? { backgroundColor: '#10B981' } : null]}
              onPress={onClose}
            >
              <Text style={styles.closeBtnText}>
                {step === 'success' ? 'PROCEED TO ASSISTANCE' : 'CANCEL'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 12,
  },
  stepsContainer: {
    width: '100%',
    gap: 10,
    marginVertical: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
  },
  stepText: {
    fontFamily: theme.fontFamilies.technical.medium,
    fontSize: 12,
    flex: 1,
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  errorTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: '#EF4444',
  },
  errorMessage: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 11,
    color: '#F8FAFC',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  retryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  retryBtnText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
  },
  closeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  closeBtnText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },
});

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
import { theme } from '../../theme';

export type AcceptorVerificationStep = 'idle' | 'biometrics' | 'challenge' | 'capsule' | 'success' | 'failed';

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
  if (!visible) return null;

  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.cardContainer}>
          <View style={styles.header}>
            <Icon
              name={step === 'failed' ? 'error-outline' : step === 'success' ? 'verified' : 'security'}
              size={32}
              color={step === 'failed' ? '#EF4444' : step === 'success' ? '#10B981' : '#38BDF8'}
            />
            <Text style={styles.title}>RESPONDER SECURITY VERIFICATION</Text>
          </View>

          <Text style={styles.subtitle}>
            Symmetric Zero-Trust Protocol Handshake
          </Text>

          <View style={styles.stepsContainer}>
            {/* Step 1: Biometric Hardware Prompt */}
            <View style={styles.stepRow}>
              <Icon
                name={
                  step === 'biometrics'
                    ? 'hourglass-empty'
                    : step === 'challenge' || step === 'capsule' || step === 'success'
                    ? 'check-circle'
                    : step === 'failed'
                    ? 'cancel'
                    : 'radio-button-unchecked'
                }
                size={20}
                color={
                  step === 'challenge' || step === 'capsule' || step === 'success'
                    ? '#10B981'
                    : step === 'failed'
                    ? '#EF4444'
                    : '#38BDF8'
                }
              />
              <Text style={styles.stepText}>1. OS Biometric Liveness Check (FaceID/Fingerprint)</Text>
            </View>

            {/* Step 2: 60s Server Challenge Nonce */}
            <View style={styles.stepRow}>
              <Icon
                name={
                  step === 'challenge'
                    ? 'hourglass-empty'
                    : step === 'capsule' || step === 'success'
                    ? 'check-circle'
                    : step === 'failed'
                    ? 'cancel'
                    : 'radio-button-unchecked'
                }
                size={20}
                color={
                  step === 'capsule' || step === 'success'
                    ? '#10B981'
                    : step === 'challenge'
                    ? '#38BDF8'
                    : '#64748B'
                }
              />
              <Text style={styles.stepText}>2. 60s Server Challenge Nonce Signature</Text>
            </View>

            {/* Step 3: Ephemeral Trust Capsule */}
            <View style={styles.stepRow}>
              <Icon
                name={
                  step === 'capsule'
                    ? 'hourglass-empty'
                    : step === 'success'
                    ? 'check-circle'
                    : step === 'failed'
                    ? 'cancel'
                    : 'radio-button-unchecked'
                }
                size={20}
                color={
                  step === 'success'
                    ? '#10B981'
                    : step === 'capsule'
                    ? '#38BDF8'
                    : '#64748B'
                }
              />
              <Text style={styles.stepText}>3. Ephemeral Trust Capsule Issued</Text>
            </View>
          </View>

          {step !== 'failed' && step !== 'success' && (
            <ActivityIndicator size="small" color="#38BDF8" style={{ marginTop: 8 }} />
          )}

          {step === 'failed' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>VERIFICATION REJECTED</Text>
              <Text style={styles.errorMessage}>{errorMessage || 'Authentication failed or was canceled.'}</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            {step === 'failed' && onRetry && (
              <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                <Text style={styles.retryButtonText}>RETRY</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>{step === 'failed' ? 'DISMISS' : 'CANCEL'}</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderColor: '#334155',
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
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 12,
    color: '#94A3B8',
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
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 8,
  },
  stepText: {
    fontFamily: theme.fontFamilies.technical.medium,
    fontSize: 12,
    color: '#E2E8F0',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 8,
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#38BDF8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 12,
    color: '#0F172A',
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 12,
    color: '#F8FAFC',
  },
});

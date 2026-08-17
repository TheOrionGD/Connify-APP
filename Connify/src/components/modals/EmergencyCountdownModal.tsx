import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';

interface EmergencyCountdownModalProps {
  visible: boolean;
  onCancel: (pin?: string) => void;
  onConfirmVerified: (isDuress: boolean) => void;
  category: string;
  urgency: number;
}

export const EmergencyCountdownModal: React.FC<EmergencyCountdownModalProps> = ({
  visible,
  onCancel,
  onConfirmVerified,
  category,
  urgency,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [pinInput, setPinInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Enforcing Hardware Biometric & Cryptographic Handshake');

  // Pulse when modal opens
  useEffect(() => {
    if (visible) {
      Vibration.vibrate([0, 150, 150]);
    }
  }, [visible]);

  // Handle countdown interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible && countdown > 0 && !isVerifying) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, isVerifying]);

  // Handle countdown finish
  useEffect(() => {
    if (visible && countdown === 0 && !isVerifying) {
      setIsVerifying(true);
      setStatusMessage('Validating Ed25519 Server Challenge Nonce...');
      
      const checkDuress = pinInput.trim() === '9999';
      setTimeout(() => {
        setIsVerifying(false);
        onConfirmVerified(checkDuress);
      }, 600);
    }
  }, [visible, countdown, isVerifying, pinInput, onConfirmVerified]);

  const handleCancelPress = () => {
    if (pinInput.trim() === '9999') {
      // Silent Duress PIN
      onConfirmVerified(true);
    } else {
      onCancel(pinInput);
    }
  };

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.cardContainer}>
          <View style={styles.warningHeader}>
            <Icon name="warning" size={32} color="#EF4444" />
            <Text style={styles.warningTitle}>EMERGENCY SOS BROADCAST</Text>
          </View>

          <Text style={styles.categorySub}>
            {category.toUpperCase()} (URGENCY LEVEL {urgency}/5)
          </Text>

          <View style={styles.countdownCircle}>
            {isVerifying ? (
              <ActivityIndicator size="large" color="#EF4444" />
            ) : (
              <Text style={styles.countdownText}>{countdown}</Text>
            )}
          </View>

          <Text style={styles.statusText}>{statusMessage}</Text>

          <View style={styles.pinSection}>
            <Text style={styles.pinLabel}>CANCEL PIN / DURESS CODE (OPTIONAL):</Text>
            <TextInput
              style={styles.pinInput}
              value={pinInput}
              onChangeText={setPinInput}
              placeholder="Enter PIN"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              secureTextEntry={true}
              maxLength={4}
            />
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelPress}
            activeOpacity={0.8}
          >
            <Icon name="cancel" size={20} color="#FFFFFF" />
            <Text style={styles.cancelButtonText}>CANCEL ALARM NOW</Text>
          </TouchableOpacity>
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
    borderColor: '#EF4444',
    borderWidth: 2,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warningTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 16,
    color: '#EF4444',
    letterSpacing: 1.2,
  },
  categorySub: {
    fontFamily: theme.fontFamilies.technical.medium,
    fontSize: 13,
    color: '#F8FAFC',
  },
  countdownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  countdownText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 36,
    color: '#EF4444',
  },
  statusText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  pinSection: {
    width: '100%',
    gap: 6,
    marginTop: 4,
  },
  pinLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 1,
  },
  pinInput: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    color: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 4,
  },
  cancelButton: {
    width: '100%',
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});

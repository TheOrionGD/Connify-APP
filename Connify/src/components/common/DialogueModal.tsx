import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ModalProps,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';

interface DialogueModalProps extends ModalProps {
  visible: boolean;
  title: string;
  message?: string;
  iconName?: string;
  iconColor?: string;
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
  children?: React.ReactNode;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  visible,
  title,
  message,
  iconName = 'shield',
  iconColor = theme.colors.primary,
  onClose,
  confirmText = 'I UNDERSTAND',
  onConfirm,
  cancelText,
  children,
  ...props
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Outer Skeuomorphic Bevel Header */}
              <View style={styles.header}>
                <View style={styles.iconCircle}>
                  <Icon name={iconName} size={22} color={iconColor} />
                </View>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={20} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              {/* Skeuomorphic Inset Divider */}
              <View style={styles.divider} />

              {/* Message Content */}
              <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                {message ? (
                  <Text style={styles.message}>{message}</Text>
                ) : null}
                {children}
              </ScrollView>

              {/* Action Buttons with Skeuomorphic Tactile Pressed Feedback */}
              <View style={styles.actionsContainer}>
                {cancelText && (
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>
                      {cancelText.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={onConfirm || onClose}
                  activeOpacity={0.8}
                >
                  <Icon name="check" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.confirmButtonText}>
                    {confirmText.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FAE4E4',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    elevation: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(220, 38, 38, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#FCF1F1',
  },
  divider: {
    height: 1,
    backgroundColor: '#FAE4E4',
    marginVertical: 2,
  },
  contentScroll: {
    maxHeight: 280,
  },
  message: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  actionsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#FCF1F1',
    borderWidth: 1,
    borderColor: '#FAE4E4',
  },
  cancelButtonText: {
    color: '#64748B',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  confirmButton: {
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
});

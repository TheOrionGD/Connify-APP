import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ModalProps,
} from 'react-native';
import { theme } from '../../theme';

interface DialogueModalProps extends ModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  visible,
  title,
  message,
  onClose,
  confirmText = 'OK',
  onConfirm,
  cancelText,
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
            <View style={styles.modalContainer}>
              {/* Title in Plus Jakarta Sans */}
              <Text style={styles.title}>{title}</Text>
              
              {/* Message in Work Sans */}
              <Text style={styles.message}>{message}</Text>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                {cancelText && (
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>
                      {cancelText.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={onConfirm || onClose}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, styles.confirmButtonText]}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.containerPadding,
  },
  modalContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest, // white
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: theme.colors.onBackground, // black outline
    borderRadius: theme.spacing.radiusMd, // 12px
    padding: theme.spacing.containerPadding,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 10,
  },
  title: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 20,
    lineHeight: 28,
    color: theme.colors.primary,
    marginBottom: theme.spacing.base,
    textAlign: 'center',
  },
  message: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.onBackground,
    marginBottom: theme.spacing.stackGap,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    gap: theme.spacing.inlineGap,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.spacing.radiusSm,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: theme.colors.secondary,
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  confirmButtonText: {
    color: theme.colors.onPrimary,
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
  },
  buttonText: {
    letterSpacing: 0.5,
  },
});

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme, actionColors } from '../../theme';

interface StandardButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'dark' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const actionButtonStyle = StyleSheet.create({
  button: {
    backgroundColor: actionColors.actionRed,
    borderColor: '#EF4444',
  },
  text: {
    color: actionColors.actionButtonText,
  },
});

export const StandardButton: React.FC<StandardButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        actionButtonStyle.button,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={actionColors.actionButtonText}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              actionButtonStyle.text,
              disabled && styles.disabledText,
              icon ? styles.textWithIcon : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: theme.spacing.radiusDefault,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: '#EF4444',
    backgroundColor: actionColors.actionRed,
  },
  disabledButton: {
    backgroundColor: actionColors.actionRed,
    opacity: 0.5,
  },
  text: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: actionColors.actionButtonText,
  },
  disabledText: {
    color: '#000000',
    opacity: 0.7,
  },
  textWithIcon: {
    marginLeft: theme.spacing.base,
  },
});

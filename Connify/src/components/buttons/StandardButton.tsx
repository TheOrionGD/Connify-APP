import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../theme';

interface StandardButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const StandardButton: React.FC<StandardButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? theme.colors.onPrimary : theme.colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              isPrimary ? styles.primaryText : styles.secondaryText,
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
    height: 56,
    borderRadius: theme.spacing.radiusFull,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: 'transparent',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
  },
  disabledButton: {
    backgroundColor: theme.colors.surfaceVariant,
    borderColor: 'transparent',
    opacity: 0.6,
  },
  text: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 18,
    lineHeight: 28,
  },
  primaryText: {
    color: theme.colors.onPrimary,
  },
  secondaryText: {
    color: theme.colors.primary,
  },
  disabledText: {
    color: theme.colors.secondary,
  },
  textWithIcon: {
    marginLeft: theme.spacing.base,
  },
});

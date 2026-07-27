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
  variant?: 'primary' | 'secondary' | 'dark' | 'outline';
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
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'dark':
        return styles.darkButton;
      case 'outline':
        return styles.outlineButton;
      case 'primary':
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'dark':
        return styles.darkText;
      case 'outline':
        return styles.outlineText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? theme.colors.primary : '#FFFFFF'}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              getTextStyle(),
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
    borderColor: theme.colors.outline,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.outline,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.outline,
  },
  darkButton: {
    backgroundColor: theme.colors.onBackground,
    borderColor: theme.colors.outline,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.outline,
  },
  disabledButton: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderColor: theme.colors.outlineVariant,
    opacity: 0.6,
  },
  text: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: theme.colors.onBackground,
  },
  darkText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: theme.colors.onBackground,
  },
  disabledText: {
    color: theme.colors.onSurfaceVariant,
  },
  textWithIcon: {
    marginLeft: theme.spacing.base,
  },
});

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme, actionColors, useTheme } from '../../theme';

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
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useTheme();

  // Determine button styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: actionColors.actionRed,
          borderColor: '#EF4444',
          textColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          backgroundColor: colors.surfaceContainerHigh,
          borderColor: colors.outline,
          textColor: colors.onBackground,
        };
      case 'dark':
        return {
          backgroundColor: '#161C2E',
          borderColor: '#161C2E',
          textColor: '#FFFFFF',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.outline,
          textColor: colors.onBackground,
        };
      default:
        return {
          backgroundColor: actionColors.actionRed,
          borderColor: '#EF4444',
          textColor: '#FFFFFF',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
        },
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variantStyles.textColor}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: variantStyles.textColor,
              },
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
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  textWithIcon: {
    marginLeft: theme.spacing.base,
  },
});

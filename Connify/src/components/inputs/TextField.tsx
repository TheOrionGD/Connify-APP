import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme, useTheme } from '../../theme';

interface TextFieldProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  error?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  containerStyle,
  inputStyle,
  error,
  placeholderTextColor,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: colors.onBackground }]}>
          {label.toUpperCase()}
        </Text>
      ) : null}
      
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.surfaceContainerHigh,
            borderColor: colors.outline,
          },
          error ? { borderColor: colors.error } : null,
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.onSurface }, inputStyle]}
          placeholderTextColor={placeholderTextColor || colors.onSurfaceVariant}
          {...props}
        />
      </View>

      {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.stackGap,
    width: '100%',
  },
  label: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    marginBottom: 6,
    letterSpacing: 1,
    fontWeight: '700',
  },
  inputWrapper: {
    borderWidth: theme.spacing.borderWidthLight,
    borderRadius: theme.spacing.radiusDefault,
  },
  input: {
    height: 50,
    paddingHorizontal: 14,
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    fontFamily: theme.fontFamilies.secondary.regular,
    marginTop: 4,
    fontWeight: '600',
  },
});

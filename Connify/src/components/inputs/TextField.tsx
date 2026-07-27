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
import { theme } from '../../theme';

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
  placeholderTextColor = '#777777',
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label.toUpperCase()}</Text> : null}
      
      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={placeholderTextColor}
          {...props}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    color: theme.colors.onBackground,
    marginBottom: 6,
    letterSpacing: 1,
    fontWeight: '700',
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
  },
  inputWrapperError: {
    borderColor: theme.colors.error,
  },
  input: {
    height: 50,
    paddingHorizontal: 14,
    color: theme.colors.onBackground,
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 15,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    fontFamily: theme.fontFamilies.secondary.regular,
    marginTop: 4,
    fontWeight: '600',
  },
});

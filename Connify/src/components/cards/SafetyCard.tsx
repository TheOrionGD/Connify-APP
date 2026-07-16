import React from 'react';
import { StyleSheet, View, ViewStyle, ViewProps, StyleProp } from 'react-native';
import { theme } from '../../theme';

interface SafetyCardProps extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const SafetyCard: React.FC<SafetyCardProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest, // white
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: theme.colors.primary, // 2px Vivid Red border
    borderRadius: theme.spacing.radiusMd, // 12px
    padding: theme.spacing.containerPadding, // 20px
  },
});

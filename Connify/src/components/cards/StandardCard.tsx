import React from 'react';
import { StyleSheet, View, ViewStyle, ViewProps, StyleProp } from 'react-native';
import { theme } from '../../theme';

interface StandardCardProps extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const StandardCard: React.FC<StandardCardProps> = ({
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
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.onBackground, // deep black outline
    borderRadius: theme.spacing.radiusMd, // 12px
    padding: theme.spacing.containerPadding, // 20px
  },
});

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
    backgroundColor: '#0E1320',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderTopColor: '#EF4444',
    borderRadius: theme.spacing.radiusLg, // 16px
    padding: theme.spacing.cardPadding, // 16px
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});

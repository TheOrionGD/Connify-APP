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
    backgroundColor: theme.colors.cardBackground, // #0E1320 elevated dark
    borderWidth: 1,
    borderColor: theme.colors.cardBorder, // rgba(255, 255, 255, 0.08)
    borderTopColor: 'rgba(255, 255, 255, 0.15)', // subtle top-edge highlight
    borderRadius: theme.spacing.radiusLg, // 16px
    padding: theme.spacing.cardPadding, // 16px
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

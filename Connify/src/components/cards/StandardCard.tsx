import React from 'react';
import { StyleSheet, View, ViewStyle, ViewProps, StyleProp } from 'react-native';
import { theme, useTheme } from '../../theme';

interface StandardCardProps extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const StandardCard: React.FC<StandardCardProps> = ({
  children,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)', // subtle top-edge highlight
    borderRadius: theme.spacing.radiusLg, // 16px
    padding: theme.spacing.cardPadding, // 16px
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
});

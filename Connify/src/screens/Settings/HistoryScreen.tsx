import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Episode History</Text>
      <Text style={styles.text}>Logs of previous safe sessions.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.containerPadding,
  },
  title: {
    ...theme.typography.headlineMd,
    color: theme.colors.primary,
    marginBottom: theme.spacing.base * 1.25, // 10px spacing
  },
  text: {
    ...theme.typography.bodyMd,
    color: theme.colors.onBackground,
  },
});

export default HistoryScreen;

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';
import { StandardCard } from '../../components/cards/StandardCard';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface HistoryItem {
  id: string;
  category: string;
  timestamp: string;
  status: 'RESOLVED' | 'CANCELLED' | 'VERIFIED';
  hash: string;
}

export default function HistoryScreen({ navigation }: any) {
  // Real history storage (empty until user creates/resolves real episodes)
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyStr = await AsyncStorage.getItem('CONNIFY_EPISODE_HISTORY');
        if (historyStr) {
          setHistoryItems(JSON.parse(historyStr));
        }
      } catch (err) {
        console.warn('Failed to load local history:', err);
      }
    };
    loadHistory();
  }, []);


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Icon name="history" size={24} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>EPISODE HISTORY</Text>
        </View>
        <Icon name="security" size={22} color={theme.colors.onBackground} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Cryptographic Audit Trail</Text>
          <Text style={styles.subtitle}>
            Review your past emergency broadcasts, responder handshakes, and cryptographic audit proofs.
          </Text>
        </View>

        {historyItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="history-toggle-off" size={48} color={theme.colors.onBackground} />
            <Text style={styles.emptyTitle}>No Emergency History</Text>
            <Text style={styles.emptySub}>
              You have no past emergency broadcasts or responses logged on this device.
            </Text>
          </View>
        ) : (
          historyItems.map((item) => (
            <StandardCard key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.itemDate}>{item.timestamp}</Text>
              <View style={styles.hashBox}>
                <Text style={styles.hashLabel}>AUDIT PROOF HASH:</Text>
                <Text style={styles.hashValue} numberOfLines={1}>{item.hash}</Text>
              </View>
            </StandardCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 56,
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.outline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.containerPadding,
    backgroundColor: theme.colors.background,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    color: theme.colors.onBackground,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  container: {
    padding: theme.spacing.containerPadding,
    gap: 16,
  },
  titleSection: {
    gap: 6,
  },
  mainTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 22,
    color: theme.colors.onBackground,
  },
  subtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.onSurfaceVariant,
  },
  emptyCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusMd,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  emptyTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 18,
    color: theme.colors.onBackground,
  },
  emptySub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 19,
  },
  itemCard: {
    gap: 8,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCategory: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 16,
    color: theme.colors.onBackground,
  },
  statusPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#059669',
  },
  statusPillText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: '#059669',
  },
  itemDate: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  hashBox: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    marginTop: 4,
    gap: 2,
  },
  hashLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 9,
    color: theme.colors.onBackground,
    letterSpacing: 1,
  },
  hashValue: {
    fontFamily: theme.fontFamilies.technical.medium,
    fontSize: 11,
    color: theme.colors.primary,
  },
});

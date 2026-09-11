import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, useTheme } from '../theme';
import bundledData from '../data/governmentEmergencyNumbers.json';

interface HelplineItem {
  name: string;
  number: string;
  secondaryNumber?: string;
  displayNumber?: string;
  description: string;
  icon: string;
  color: string;
  priority?: boolean;
}

interface HelplineCategory {
  category: string;
  items: HelplineItem[];
}

export default function GovernmentEmergencyNumbersScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'EMERGENCY' | 'WOMEN' | 'CARE' | 'SCHEMES'>('ALL');

  const helplineCategories: HelplineCategory[] = (bundledData as any).INDIA_HELPLINES || [];

  const handleCall = (phone: string, secondaryPhone?: string, title?: string) => {
    if (secondaryPhone) {
      Alert.alert(
        title || 'Select Helpline Line',
        'Choose toll-free line to connect:',
        [
          { text: `Line 1: ${phone}`, onPress: () => Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Could not open dialer.')) },
          { text: `Line 2: ${secondaryPhone}`, onPress: () => Linking.openURL(`tel:${secondaryPhone}`).catch(() => Alert.alert('Error', 'Could not open dialer.')) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Could not open dialer.'));
    }
  };

  const filterMatches = (categoryName: string): boolean => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'EMERGENCY' && categoryName.includes('National')) return true;
    if (selectedFilter === 'WOMEN' && categoryName.includes('Women')) return true;
    if (selectedFilter === 'CARE' && (categoryName.includes('Child') || categoryName.includes('Cyber'))) return true;
    if (selectedFilter === 'SCHEMES' && categoryName.includes('Schemes')) return true;
    return false;
  };

  const filteredCategories = helplineCategories
    .filter((cat) => filterMatches(cat.category))
    .map((cat) => {
      const filteredItems = cat.items.filter((item) => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.number.toLowerCase().includes(q) ||
          (item.displayNumber && item.displayNumber.toLowerCase().includes(q)) ||
          (item.secondaryNumber && item.secondaryNumber.toLowerCase().includes(q)) ||
          item.description.toLowerCase().includes(q)
        );
      });
      return { ...cat, items: filteredItems };
    })
    .filter((cat) => cat.items.length > 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.outline }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
          NATIONAL & SCHEME HELPLINES
        </Text>
        <TouchableOpacity
          onPress={() => handleCall('112', undefined, 'National Emergency')}
          style={styles.sosQuickBadge}
        >
          <Icon name="phone" size={14} color="#FFFFFF" />
          <Text style={styles.sosQuickText}>112</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Title & Offline Notice */}
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: colors.onBackground }]}>
            Emergency & Public Helplines
          </Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            All national crisis numbers, women protection lines, cyber crime, and public welfare scheme helplines. Works 100% offline via carrier network.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <Icon name="search" size={20} color={colors.onSurfaceVariant} />
          <TextInput
            style={[styles.searchInput, { color: colors.onBackground }]}
            placeholder="Search helpline (e.g., 112, 1091, Mudra, Awas)..."
            placeholderTextColor={colors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={18} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {[
            { key: 'ALL', label: 'ALL NUMBERS' },
            { key: 'EMERGENCY', label: '🚨 EMERGENCY (112, 100..)' },
            { key: 'WOMEN', label: '🛡️ WOMEN SAFETY' },
            { key: 'CARE', label: '🆘 CYBER & HEALTH' },
            { key: 'SCHEMES', label: '🏛️ GOVT SCHEMES' },
          ].map((tab) => {
            const isSelected = selectedFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterPill,
                  { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline },
                  isSelected ? { backgroundColor: colors.primary, borderColor: colors.primary } : null,
                ]}
                onPress={() => setSelectedFilter(tab.key as any)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isSelected ? '#FFFFFF' : colors.onBackground },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Helplines Grouped by Category */}
        {filteredCategories.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: colors.outline }]}>
            <Icon name="search-off" size={42} color={colors.onSurfaceVariant} />
            <Text style={[styles.emptyTitle, { color: colors.onBackground }]}>No Helplines Found</Text>
            <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>
              No matching numbers for "{searchQuery}". Try searching "112", "women", or "police".
            </Text>
          </View>
        ) : (
          filteredCategories.map((group) => (
            <View key={group.category} style={styles.groupSection}>
              <View style={styles.groupHeader}>
                <Text style={[styles.groupTitle, { color: colors.onBackground }]}>
                  {group.category.toUpperCase()}
                </Text>
              </View>

              <View style={styles.grid}>
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.name + item.number}
                    style={[
                      styles.card,
                      { backgroundColor: colors.surfaceContainerLowest, borderColor: item.priority ? item.color : colors.outline },
                      item.priority ? { borderWidth: 1.5 } : null,
                    ]}
                    onPress={() => handleCall(item.number, item.secondaryNumber, item.name)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconBox, { backgroundColor: item.color + '18' }]}>
                      <Icon name={item.icon} size={26} color={item.color} />
                    </View>

                    <View style={styles.cardContent}>
                      <View style={styles.cardTitleRow}>
                        <Text style={[styles.cardTitle, { color: colors.onBackground }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.priority && (
                          <View style={[styles.priorityBadge, { backgroundColor: item.color + '20' }]}>
                            <Text style={[styles.priorityBadgeText, { color: item.color }]}>24x7 SOS</Text>
                          </View>
                        )}
                      </View>

                      <Text style={[styles.cardNumber, { color: item.color }]}>
                        {item.displayNumber || item.number}
                      </Text>

                      <Text style={[styles.cardDesc, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
                        {item.description}
                      </Text>
                    </View>

                    <View style={[styles.dialBtn, { backgroundColor: item.color }]}>
                      <Icon name="call" size={18} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    letterSpacing: 1.1,
    fontWeight: '700',
  },
  sosQuickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  sosQuickText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    fontWeight: '700',
  },
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  titleSection: {
    gap: 6,
  },
  mainTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 22,
  },
  subtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.fontFamilies.secondary.medium,
    fontSize: 14,
    height: '100%',
  },
  filterRow: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  groupSection: {
    gap: 10,
    marginTop: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  grid: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 14,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 9,
  },
  cardNumber: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 17,
    letterSpacing: 0.8,
  },
  cardDesc: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  dialBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  emptyTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 16,
  },
  emptySub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 12,
    textAlign: 'center',
  },
});

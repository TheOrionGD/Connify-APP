import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme';
import { CategoryType, useEpisodeStore } from '../../stores/episodeStore';
import { useLocationStore } from '../../stores/locationStore';
import { getCategoryUrgencyContext } from '../../utils/categoryContexts';

export interface CategoryItem {
  name: CategoryType;
  icon: string;
  group: 'emergency' | 'connection';
  description: string;
  color: string;
}

export const ALL_40_CATEGORIES: CategoryItem[] = [
  // --- 22 Emergency & Assistance Categories ---
  { name: 'Women Safety & Harassment', icon: 'health-and-safety', group: 'emergency', description: 'SOS panic, stalking, harassment, or female safety intervention', color: '#EC4899' },
  { name: 'Medical Emergency', icon: 'medical-services', group: 'emergency', description: 'Urgent medical aid, trauma, or cardiac emergency', color: '#EF4444' },
  { name: 'Security & Assault', icon: 'security', group: 'emergency', description: 'Physical threat, active assault, or immediate danger', color: '#DC2626' },
  { name: 'Fire & Explosion', icon: 'local-fire-department', group: 'emergency', description: 'Active fire outbreak, smoke, or explosion hazard', color: '#F97316' },
  { name: 'Accident & Collision', icon: 'car-crash', group: 'emergency', description: 'Road crash, vehicular accident, or injury on transit', color: '#EAB308' },
  { name: 'Transport & Evacuation', icon: 'local-taxi', group: 'emergency', description: 'Emergency transport, ambulance, or safe evacuation', color: '#3B82F6' },
  { name: 'Disaster & Flood', icon: 'thunderstorm', group: 'emergency', description: 'Flash flood, storm, earthquake, or severe hazard', color: '#0284C7' },
  { name: 'Domestic Violence & Abuse', icon: 'gavel', group: 'emergency', description: 'Domestic abuse, violent dispute, or protective distress', color: '#8B5CF6' },
  { name: 'Child Emergency & Lost', icon: 'child-care', group: 'emergency', description: 'Missing child, infant distress, or pediatric emergency', color: '#F43F5E' },
  { name: 'Senior Citizen Assist', icon: 'elderly', group: 'emergency', description: 'Elderly fall, confusion, or senior assistance', color: '#10B981' },
  { name: 'Mental Health Crisis', icon: 'psychology', group: 'emergency', description: 'Severe distress, panic attack, or psychological aid', color: '#6366F1' },
  { name: 'Stranded & Breakdown', icon: 'build', group: 'emergency', description: 'Vehicle breakdown, flat tire, or isolated location', color: '#64748B' },
  { name: 'Blood & Organ Need', icon: 'bloodtype', group: 'emergency', description: 'Urgent blood donor requirement or rare group need', color: '#E11D48' },
  { name: 'Oxygen & Med Supply', icon: 'vaccines', group: 'emergency', description: 'Critical oxygen cylinder or lifesaving medication', color: '#06B6D4' },
  { name: 'Cyber Threat & Stalking', icon: 'phishing', group: 'emergency', description: 'Digital harassment, blackmail, or cyber stalking', color: '#0284C7' },
  { name: 'Animal Rescue & Hazard', icon: 'pets', group: 'emergency', description: 'Injured animal, rabid hazard, or wildlife rescue', color: '#84CC16' },
  { name: 'Power Grid & Blackout', icon: 'power-off', group: 'emergency', description: 'Complete power failure, grid blackout, or electrical hazard', color: '#F59E0B' },
  { name: 'Gas & Chemical Leak', icon: 'warning-amber', group: 'emergency', description: 'Toxic gas leak, chemical spill, or gas cylinder hazard', color: '#D97706' },
  { name: 'Theft & Burglary', icon: 'lock', group: 'emergency', description: 'Active break-in, theft, robbery, or property intrusion', color: '#475569' },
  { name: 'Food & Water Crisis', icon: 'set-meal', group: 'emergency', description: 'Emergency food, clean water shortage, or relief', color: '#14B8A6' },
  { name: 'Shelter & Homeless Relief', icon: 'night-shelter', group: 'emergency', description: 'Extreme weather shelter, displacement, or emergency bed', color: '#A855F7' },
  { name: 'General Request', icon: 'report-problem', group: 'emergency', description: 'General community assistance or unlisted distress', color: '#3B82F6' },

  // --- 20 Stranger Connection Categories ---
  { name: 'Coffee & Social Chat', icon: 'coffee', group: 'connection', description: 'Casual coffee meetups, friendly banter, & local friend making', color: '#F59E0B' },
  { name: 'Study & Homework Buddy', icon: 'school', group: 'connection', description: 'Co-studying, exam prep, library sessions, & academic support', color: '#3B82F6' },
  { name: 'Sports & Workout Partner', icon: 'fitness-center', group: 'connection', description: 'Gym spotter, jogging companion, tennis/badminton partner', color: '#10B981' },
  { name: 'Travel & Sightseeing Companion', icon: 'explore', group: 'connection', description: 'Exploring local spots, heritage walks, & road trips', color: '#8B5CF6' },
  { name: 'Language Exchange & Practice', icon: 'translate', group: 'connection', description: 'Conversational practice, language swap, & native peer practice', color: '#EC4899' },
  { name: 'Skill Swap & Mentorship', icon: 'psychology', group: 'connection', description: 'Mutual skill sharing, coding/design swap, & peer guidance', color: '#6366F1' },
  { name: 'Hobby & Gaming Pair', icon: 'sports-esports', group: 'connection', description: 'Board games, video game co-op, anime, & tabletop gaming', color: '#A855F7' },
  { name: 'Co-Working & Professional Network', icon: 'work', group: 'connection', description: 'Freelance co-working, cafe work sprints, & networking', color: '#0EA5E9' },
  { name: 'Event & Concert Buddy', icon: 'confirmation-number', group: 'connection', description: 'Music gigs, theater, comedy shows, & festival buddies', color: '#F43F5E' },
  { name: 'Neighborhood Advice & Local Guide', icon: 'map', group: 'connection', description: 'Insider area tips, safe neighborhood orientation, & advice', color: '#14B8A6' },
  { name: 'Pet Playdate & Walking', icon: 'pets', group: 'connection', description: 'Dog park playdates, pet walks, & animal lover meetups', color: '#84CC16' },
  { name: 'Foodie & Culinary Meetup', icon: 'restaurant', group: 'connection', description: 'Trying new food spots, night markets, & dining meetups', color: '#F97316' },
  { name: 'Book & Film Discussion', icon: 'menu-book', group: 'connection', description: 'Book clubs, cinema outings, literary chat, & screenings', color: '#D97706' },
  { name: 'Music Jamming & Creative', icon: 'music-note', group: 'connection', description: 'Acoustic jam sessions, band practice, & creative pairing', color: '#E11D48' },
  { name: 'Carpool & Commute Partner', icon: 'directions-car', group: 'connection', description: 'Shared daily commute, ride sharing, & splitting gas', color: '#2563EB' },
  { name: 'Tech & Coding Collaboration', icon: 'code', group: 'connection', description: 'Hackathons, open-source pair programming, & side projects', color: '#0284C7' },
  { name: 'Item Sharing & Borrowing', icon: 'swap-horiz', group: 'connection', description: 'Borrowing tools, books, camping gear, & neighborhood items', color: '#64748B' },
  { name: 'Volunteer & Community Action', icon: 'volunteer-activism', group: 'connection', description: 'Park cleanups, food drives, & local civic action pairing', color: '#059669' },
  { name: 'Arts & Craft Partner', icon: 'palette', group: 'connection', description: 'Painting, sketch walks, pottery, & art gallery visits', color: '#D946EF' },
  { name: 'City Exploration & Walking Group', icon: 'directions-walk', group: 'connection', description: 'Scenic walks, evening strolls, & city wandering groups', color: '#10B981' },
];

interface FortyCategoriesSectionProps {
  onSelectCategory: (category: CategoryType) => void;
}

export function FortyCategoriesSection({ onSelectCategory }: FortyCategoriesSectionProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'emergency' | 'connection'>('all');

  const filteredCategories = ALL_40_CATEGORIES.filter((cat) => {
    const matchesTab = activeTab === 'all' || cat.group === activeTab;
    const matchesQuery =
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
      {/* Title Header */}
      <View style={styles.headerRow}>
        <Icon name="grid-view" size={22} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
          40 SAFETY & CONNECTION CATEGORIES
        </Text>
      </View>
      <Text style={[styles.sectionSub, { color: colors.onSurfaceVariant }]}>
        Select any category to immediately dispatch a radius request to nearby volunteer responders.
      </Text>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'all' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            ALL ({ALL_40_CATEGORIES.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'emergency' && { backgroundColor: '#EF4444' }]}
          onPress={() => setActiveTab('emergency')}
        >
          <Text style={[styles.tabText, activeTab === 'emergency' && styles.tabTextActive]}>
            SAFETY (22)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'connection' && { backgroundColor: '#F59E0B' }]}
          onPress={() => setActiveTab('connection')}
        >
          <Text style={[styles.tabText, activeTab === 'connection' && styles.tabTextActive]}>
            SOCIAL (20)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={[styles.searchBox, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
        <Icon name="search" size={20} color={colors.onSurfaceVariant} />
        <TextInput
          style={[styles.searchInput, { color: colors.onBackground }]}
          placeholder="Search all 40 categories..."
          placeholderTextColor={colors.onSurfaceVariant}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={18} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Grid List */}
      <View style={styles.gridContainer}>
        {filteredCategories.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[styles.catCard, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}
            onPress={() => onSelectCategory(item.name)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconCircle, { backgroundColor: `${item.color}1E` }]}>
              <Icon name={item.icon} size={22} color={item.color} />
            </View>

            <View style={styles.catDetails}>
              <Text style={[styles.catName, { color: colors.onBackground }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.catDesc, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
                {item.description}
              </Text>
            </View>

            <Icon name="chevron-right" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 16,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#374151',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 14,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  gridContainer: {
    gap: 10,
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catDetails: {
    flex: 1,
  },
  catName: {
    fontSize: 13,
    fontWeight: '700',
  },
  catDesc: {
    fontSize: 11,
    marginTop: 2,
  },
});

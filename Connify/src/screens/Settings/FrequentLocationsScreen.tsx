import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, useTheme } from '../../theme';
import { useFrequentLocationsStore, FrequentLocation } from '../../stores/frequentLocationsStore';
import { useLocationStore } from '../../stores/locationStore';

const CATEGORY_ICONS: Record<FrequentLocation['category'], string> = {
  Home: 'home',
  Work: 'business',
  Campus: 'school',
  Gym: 'fitness-center',
  Family: 'family-restroom',
  'Safe Haven': 'shield',
};

export default function FrequentLocationsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { locations, loadLocations, addLocation, deleteLocation, setDefaultLocation } = useFrequentLocationsStore();
  const { latitude, longitude } = useLocationStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FrequentLocation['category']>('Home');
  const [addressInput, setAddressInput] = useState('');
  const [useCurrentGps, setUseCurrentGps] = useState(true);

  useEffect(() => {
    loadLocations();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a label for this location (e.g. Home, Work).');
      return;
    }

    const lat = useCurrentGps && latitude ? latitude : 12.971598;
    const lng = useCurrentGps && longitude ? longitude : 77.594566;
    const addr = addressInput.trim() || (useCurrentGps ? `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})` : 'Saved Coordinates');

    await addLocation({
      name: name.trim(),
      category,
      address: addr,
      latitude: lat,
      longitude: lng,
      iconName: CATEGORY_ICONS[category] || 'place',
    });

    setName('');
    setAddressInput('');
    setModalVisible(false);
    Alert.alert('Saved', `${name} has been added to your Frequent Safe Places.`);
  };

  const handleDelete = (id: string, locName: string) => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to remove "${locName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteLocation(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>Frequent Safe Places</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButtonHeader}>
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.bannerCard, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
          <Icon name="place" size={28} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: colors.onBackground }]}>Quick Emergency Destinations</Text>
            <Text style={[styles.bannerSub, { color: colors.onSurfaceVariant }]}>
              Save your frequent routes & safe havens for 1-tap rapid dispatch during emergencies.
            </Text>
          </View>
        </View>

        {locations.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <Icon name="add-location-alt" size={48} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.onBackground }]}>No Saved Safe Places</Text>
            <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
              You haven't saved any frequent destinations yet. Add your home, workplace, university campus, or emergency shelter for 1-tap rapid dispatch.
            </Text>
            <TouchableOpacity
              style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(true)}
            >
              <Icon name="add" size={18} color="#FFFFFF" />
              <Text style={styles.emptyActionBtnText}>ADD FREQUENT PLACE</Text>
            </TouchableOpacity>
          </View>
        ) : (
          locations.map((loc) => (
            <View key={loc.id} style={[styles.locationCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: loc.isDefault ? colors.primary : colors.outline }]}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '18' }]}>
                <Icon name={loc.iconName || CATEGORY_ICONS[loc.category] || 'place'} size={24} color={colors.primary} />
              </View>

              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.locName, { color: colors.onBackground }]}>{loc.name}</Text>
                  {loc.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.locCategory, { color: colors.primary }]}>{loc.category.toUpperCase()}</Text>
                <Text style={[styles.locAddress, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                  {loc.address}
                </Text>
                <Text style={{ fontFamily: theme.fontFamilies.technical.medium, fontSize: 10, color: colors.onSurfaceVariant }}>
                  GPS: {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                </Text>
              </View>

              <View style={{ gap: 8, alignItems: 'center' }}>
                {!loc.isDefault && (
                  <TouchableOpacity onPress={() => setDefaultLocation(loc.id)} style={{ padding: 6 }}>
                    <Icon name="star-outline" size={20} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(loc.id, loc.name)} style={{ padding: 6 }}>
                  <Icon name="delete-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <Text style={[styles.modalTitle, { color: colors.onBackground }]}>Add Saved Safe Place</Text>

            <Text style={styles.inputLabel}>LABEL NAME</Text>
            <TextInput
              style={[styles.input, { color: colors.onBackground, borderColor: colors.outline }]}
              placeholder="e.g. Home, Work, University Campus"
              placeholderTextColor={colors.onSurfaceVariant}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>CATEGORY</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(['Home', 'Work', 'Campus', 'Gym', 'Family', 'Safe Haven'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: category === cat ? colors.primary : colors.surfaceVariant,
                      borderColor: category === cat ? colors.primary : colors.outline,
                    },
                  ]}
                >
                  <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 11, color: category === cat ? '#FFFFFF' : colors.onBackground }}>
                    {cat.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>ADDRESS / LANDMARK</Text>
            <TextInput
              style={[styles.input, { color: colors.onBackground, borderColor: colors.outline }]}
              placeholder="Optional address details"
              placeholderTextColor={colors.onSurfaceVariant}
              value={addressInput}
              onChangeText={setAddressInput}
            />

            <TouchableOpacity
              onPress={() => setUseCurrentGps(!useCurrentGps)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 }}
            >
              <Icon name={useCurrentGps ? 'check-box' : 'check-box-outline-blank'} size={22} color={colors.primary} />
              <Text style={{ fontFamily: theme.fontFamilies.secondary.medium, fontSize: 12, color: colors.onBackground }}>
                Use Current Live GPS Position ({latitude ? `${latitude.toFixed(3)}, ${longitude?.toFixed(3)}` : 'Detecting...'})
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalVisible(false)}>
                <Text style={{ fontFamily: theme.fontFamilies.technical.bold, color: colors.onSurfaceVariant }}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtnSave, { backgroundColor: colors.primary }]} onPress={handleCreate}>
                <Text style={{ fontFamily: theme.fontFamilies.technical.bold, color: '#FFFFFF' }}>SAVE PLACE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#33333333',
  },
  backButton: { padding: 8 },
  headerTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 18 },
  addButtonHeader: { padding: 8 },
  scrollContent: { padding: 16, gap: 12 },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  bannerTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 14 },
  bannerSub: { fontFamily: theme.fontFamilies.secondary.regular, fontSize: 12, marginTop: 2 },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locName: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 15 },
  defaultBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  defaultBadgeText: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 9, color: '#FFFFFF' },
  locCategory: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 10, marginVertical: 2 },
  locAddress: { fontFamily: theme.fontFamilies.secondary.regular, fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 380, borderRadius: 16, padding: 20, gap: 12, borderWidth: 1 },
  modalTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 17 },
  inputLabel: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 10, letterSpacing: 1, marginTop: 4 },
  input: { height: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, fontFamily: theme.fontFamilies.secondary.regular, fontSize: 13 },
  catChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },
  modalBtnCancel: { paddingVertical: 10, paddingHorizontal: 16 },
  modalBtnSave: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  emptyContainer: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 8,
  },
  emptyTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  emptyActionBtnText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

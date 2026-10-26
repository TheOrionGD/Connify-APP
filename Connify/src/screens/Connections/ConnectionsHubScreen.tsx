import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme';
import { useLocationStore } from '../../stores/locationStore';
import { useConnectionStore, StrangerConnection } from '../../stores/connectionStore';

export default function ConnectionsHubScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { latitude, longitude, fetchLocation } = useLocationStore();
  const {
    unit,
    radiusKm,
    radiusMeters,
    limits,
    nearbyStrangers,
    activeConnections,
    userRatings,
    loading,
    error,
    setDistanceUnit,
    setRadius,
    setDailyLimit,
    rateConnection,
    connectWithStranger,
    disconnectStranger,
    fetchRealStrangersInPerimeter,
    loadSavedSettings,
  } = useConnectionStore();

  const [inputRadius, setInputRadius] = useState<string>(
    unit === 'km' ? radiusKm.toString() : radiusMeters.toString()
  );
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [selectedForRating, setSelectedForRating] = useState<StrangerConnection | null>(null);
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [showLimitsModal, setShowLimitsModal] = useState<boolean>(false);
  const [dailyLimitInput, setDailyLimitInput] = useState<string>(limits.dailyLimit.toString());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadSavedSettings();
    if (!latitude || !longitude) {
      fetchLocation();
    }
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      fetchRealStrangersInPerimeter(latitude, longitude);
    }
  }, [latitude, longitude, radiusMeters]);

  useEffect(() => {
    setInputRadius(unit === 'km' ? radiusKm.toString() : radiusMeters.toString());
  }, [unit, radiusKm, radiusMeters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLocation();
    if (latitude && longitude) {
      await fetchRealStrangersInPerimeter(latitude, longitude);
    }
    setRefreshing(false);
  }, [latitude, longitude, radiusMeters]);

  const handleApplyRadius = () => {
    const val = parseFloat(inputRadius);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid Radius', 'Please enter a valid positive number for radius.');
      return;
    }
    if (unit === 'km' && (val < 0.1 || val > 100)) {
      Alert.alert('Out of Range', 'Perimeter radius in kilometers must be between 0.1 km and 100 km.');
      return;
    }
    if (unit === 'meters' && (val < 100 || val > 100000)) {
      Alert.alert('Out of Range', 'Perimeter radius in meters must be between 100 m and 100,000 m.');
      return;
    }

    setRadius(val, unit);
    if (latitude && longitude) {
      fetchRealStrangersInPerimeter(latitude, longitude);
    }
  };

  const handleToggleUnit = (newUnit: 'km' | 'meters') => {
    if (newUnit === unit) return;
    setDistanceUnit(newUnit);
  };

  const handleConnect = async (stranger: StrangerConnection) => {
    const success = await connectWithStranger(stranger);
    if (!success) {
      Alert.alert(
        'Connection Limit Reached',
        `You have reached the maximum of ${limits.maxActiveSimultaneous} active connections simultaneously. Disconnect one to connect with a new person.`
      );
    } else {
      Alert.alert('Connected!', `You have initiated connection with ${stranger.name}.`);
    }
  };

  const handleOpenRating = (stranger: StrangerConnection) => {
    setSelectedForRating(stranger);
    setSelectedStars(userRatings[stranger.id] || 5);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (selectedForRating) {
      await rateConnection(selectedForRating.id, selectedStars);
      setShowRatingModal(false);
      Alert.alert('Rating Submitted', `Thank you for rating ${selectedForRating.name} ${selectedStars} stars.`);
    }
  };

  const handleSaveLimits = () => {
    const val = parseInt(dailyLimitInput, 10);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid Limit', 'Please enter a positive number.');
      return;
    }
    setDailyLimit(val);
    setShowLimitsModal(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surfaceContainerLowest, borderBottomColor: colors.outline }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceContainerHigh }]}
          activeOpacity={0.8}
        >
          <Icon name="arrow-back" size={22} color={colors.onBackground} />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>CONNECTIONS</Text>
          <Text style={[styles.headerSubtitle, { color: colors.primary }]}>
            Location Perimeter & People Discovery
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowLimitsModal(true)}
          style={[styles.settingsBtn, { backgroundColor: colors.surfaceContainerHigh }]}
          activeOpacity={0.8}
        >
          <Icon name="tune" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Perimeter Radius Configuration Card */}
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.cardHeader}>
            <Icon name="radar" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onBackground }]}>PERIMETER & RADIUS LIMIT</Text>
          </View>
          <Text style={[styles.cardDescription, { color: colors.onSurfaceVariant }]}>
            Set your interaction perimeter. Connify connects you only with people/requests within this real-time location boundary.
          </Text>

          {/* Unit Switcher (Radial/Segment Buttons: KM vs METERS) */}
          <View style={styles.unitSelectorRow}>
            <Text style={[styles.unitLabel, { color: colors.onBackground }]}>Unit:</Text>
            <TouchableOpacity
              style={[
                styles.radialOption,
                {
                  backgroundColor: unit === 'km' ? colors.primary : colors.surfaceContainerHigh,
                  borderColor: unit === 'km' ? colors.primary : colors.outline,
                },
              ]}
              onPress={() => handleToggleUnit('km')}
              activeOpacity={0.8}
            >
              <Icon
                name={unit === 'km' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={16}
                color={unit === 'km' ? '#FFFFFF' : colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.radialText,
                  { color: unit === 'km' ? '#FFFFFF' : colors.onBackground, fontWeight: '700' },
                ]}
              >
                Kilometers (km)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radialOption,
                {
                  backgroundColor: unit === 'meters' ? colors.primary : colors.surfaceContainerHigh,
                  borderColor: unit === 'meters' ? colors.primary : colors.outline,
                },
              ]}
              onPress={() => handleToggleUnit('meters')}
              activeOpacity={0.8}
            >
              <Icon
                name={unit === 'meters' ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={16}
                color={unit === 'meters' ? '#FFFFFF' : colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.radialText,
                  { color: unit === 'meters' ? '#FFFFFF' : colors.onBackground, fontWeight: '700' },
                ]}
              >
                Meters (m)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Radius Input Form */}
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
              <Icon name="straighten" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.textInput, { color: colors.onBackground }]}
                keyboardType="decimal-pad"
                value={inputRadius}
                onChangeText={setInputRadius}
                placeholder={unit === 'km' ? 'Default: 1.0' : 'Default: 1000'}
                placeholderTextColor={colors.onSurfaceVariant}
              />
              <Text style={[styles.inputUnitTag, { color: colors.primary }]}>{unit}</Text>
            </View>

            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={handleApplyRadius}
              activeOpacity={0.8}
            >
              <Text style={styles.applyBtnText}>APPLY</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Preset Buttons */}
          <View style={styles.presetRow}>
            {[0.5, 1.0, 2.0, 5.0, 10.0].map((presetVal) => {
              const displayVal = unit === 'km' ? `${presetVal} km` : `${presetVal * 1000} m`;
              const isSelected =
                unit === 'km'
                  ? Math.abs(radiusKm - presetVal) < 0.05
                  : Math.abs(radiusMeters - presetVal * 1000) < 50;

              return (
                <TouchableOpacity
                  key={presetVal}
                  style={[
                    styles.presetBadge,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceContainerHigh,
                      borderColor: isSelected ? colors.primary : colors.outline,
                    },
                  ]}
                  onPress={() => {
                    setRadius(presetVal, 'km');
                    if (latitude && longitude) {
                      fetchRealStrangersInPerimeter(latitude, longitude);
                    }
                  }}
                >
                  <Text style={[styles.presetText, { color: isSelected ? '#FFFFFF' : colors.onBackground }]}>
                    {displayVal}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Active Connections Section */}
        {activeConnections.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <View style={styles.cardHeader}>
              <Icon name="people" size={22} color="#10B981" />
              <Text style={[styles.cardTitle, { color: colors.onBackground }]}>
                ACTIVE CONNECTED PEOPLE ({activeConnections.length}/{limits.maxActiveSimultaneous})
              </Text>
            </View>

            {activeConnections.map((item) => (
              <View
                key={item.id}
                style={[styles.connectionCard, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}
              >
                <View style={styles.connectionTop}>
                  <View style={[styles.avatar, { backgroundColor: '#10B981' }]}>
                    <Icon name="person" size={22} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.personName, { color: colors.onBackground }]}>{item.name}</Text>
                    <Text style={[styles.personCategory, { color: colors.onSurfaceVariant }]}>
                      Category: {item.category.toUpperCase()} • {item.distanceMeters}m away
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.rateBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleOpenRating(item)}
                  >
                    <Icon name="star" size={16} color="#FFFFFF" />
                    <Text style={styles.rateBtnText}>RATE</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.connectionBottom}>
                  <Text style={[styles.connectedTime, { color: colors.onSurfaceVariant }]}>
                    Status: <Text style={{ color: '#10B981', fontWeight: 'bold' }}>CONNECTED</Text>
                  </Text>
                  <TouchableOpacity
                    style={[styles.disconnectBtn, { borderColor: '#EF4444' }]}
                    onPress={() => disconnectStranger(item.id)}
                  >
                    <Text style={[styles.disconnectText, { color: '#EF4444' }]}>Disconnect</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Discovered Strangers in Perimeter (Database-backed) */}
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
          <View style={styles.cardHeader}>
            <Icon name="near-me" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onBackground }]}>
              DISCOVER PEOPLE IN PERIMETER
            </Text>
          </View>
          <Text style={[styles.cardDescription, { color: colors.onSurfaceVariant }]}>
            Live community members and requests in your {unit === 'km' ? `${radiusKm} km` : `${radiusMeters} m`}{' '}
            perimeter. Google Play privacy compliant — actual coordinates remain shielded.
          </Text>

          {loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
                Scanning perimeter for real users...
              </Text>
            </View>
          ) : nearbyStrangers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="person-search" size={48} color={colors.onSurfaceVariant} />
              <Text style={[styles.emptyTitle, { color: colors.onBackground }]}>No strangers active in this perimeter</Text>
              <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
                Try widening your perimeter radius (e.g. 2 km or 5 km) to connect with more community members.
              </Text>
              <TouchableOpacity
                style={[styles.expandBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setRadius(2.0, 'km');
                  if (latitude && longitude) {
                    fetchRealStrangersInPerimeter(latitude, longitude);
                  }
                }}
              >
                <Text style={styles.expandBtnText}>EXPAND TO 2 KM</Text>
              </TouchableOpacity>
            </View>
          ) : (
            nearbyStrangers.map((stranger) => {
              const isAlreadyConnected = activeConnections.some((c) => c.id === stranger.id);
              const userGivenRating = userRatings[stranger.id];

              return (
                <View
                  key={stranger.id}
                  style={[styles.strangerCard, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}
                >
                  <View style={styles.strangerTop}>
                    <View style={[styles.avatar, { backgroundColor: colors.surfaceContainerLowest }]}>
                      <Icon name="person-pin" size={26} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.personName, { color: colors.onBackground }]}>{stranger.name}</Text>
                      <Text style={[styles.personDistance, { color: colors.primary }]}>
                        {stranger.distanceMeters >= 1000
                          ? `${(stranger.distanceMeters / 1000).toFixed(1)} km away`
                          : `${stranger.distanceMeters} m away`}
                      </Text>
                      <View style={styles.ratingBadge}>
                        <Icon name="star" size={14} color="#F59E0B" />
                        <Text style={[styles.ratingScore, { color: colors.onBackground }]}>
                          {userGivenRating ? `${userGivenRating}.0 (You)` : `${stranger.rating} (Avg)`}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.connectActionBtn,
                        {
                          backgroundColor: isAlreadyConnected ? colors.surfaceContainerLowest : colors.primary,
                          borderColor: isAlreadyConnected ? colors.outline : colors.primary,
                        },
                      ]}
                      disabled={isAlreadyConnected}
                      onPress={() => handleConnect(stranger)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.connectActionText,
                          { color: isAlreadyConnected ? colors.onSurfaceVariant : '#FFFFFF' },
                        ]}
                      >
                        {isAlreadyConnected ? 'CONNECTED' : 'CONNECT'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Rating Dialog Modal */}
      <Modal visible={showRatingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <Text style={[styles.modalTitle, { color: colors.onBackground }]}>Rate Connection</Text>
            <Text style={[styles.modalSubtitle, { color: colors.onSurfaceVariant }]}>
              How was your interaction with {selectedForRating?.name}?
            </Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setSelectedStars(star)}>
                  <Icon
                    name={star <= selectedStars ? 'star' : 'star-border'}
                    size={38}
                    color="#F59E0B"
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.outline }]}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.onSurfaceVariant }]}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: colors.primary }]}
                onPress={handleSubmitRating}
              >
                <Text style={styles.modalSubmitText}>SUBMIT RATING</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Limits Settings Modal */}
      <Modal visible={showLimitsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <Text style={[styles.modalTitle, { color: colors.onBackground }]}>Connection Limits</Text>
            <Text style={[styles.modalSubtitle, { color: colors.onSurfaceVariant }]}>
              Control daily connection quota to prevent spam and maintain safe interactions.
            </Text>

            <View style={[styles.inputContainer, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline, marginVertical: 12 }]}>
              <Icon name="filter-list" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.textInput, { color: colors.onBackground }]}
                keyboardType="numeric"
                value={dailyLimitInput}
                onChangeText={setDailyLimitInput}
                placeholder="10"
                placeholderTextColor={colors.onSurfaceVariant}
              />
              <Text style={[styles.inputUnitTag, { color: colors.primary }]}>per day</Text>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.outline }]}
                onPress={() => setShowLimitsModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.onSurfaceVariant }]}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveLimits}
              >
                <Text style={styles.modalSubmitText}>SAVE LIMITS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleGroup: { flex: 1, marginLeft: 12 },
  headerTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, marginLeft: 8, letterSpacing: -0.2 },
  cardDescription: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
  unitSelectorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  unitLabel: { fontSize: 13, fontWeight: '600', marginRight: 10 },
  radialOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  radialText: { fontSize: 12, marginLeft: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  textInput: { flex: 1, fontSize: 14, fontWeight: '600' },
  inputUnitTag: { fontSize: 13, fontWeight: '700' },
  applyBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  applyBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  presetBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetText: { fontSize: 11, fontWeight: '600' },
  connectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
  },
  connectionTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personName: { fontSize: 14, fontWeight: '700' },
  personCategory: { fontSize: 11, marginTop: 2 },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  rateBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  connectionBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#374151',
  },
  connectedTime: { fontSize: 11 },
  disconnectBtn: { borderWidth: 1, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  disconnectText: { fontSize: 11, fontWeight: 'bold' },
  strangerCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 10,
  },
  strangerTop: { flexDirection: 'row', alignItems: 'center' },
  personDistance: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingScore: { fontSize: 11, marginLeft: 4, fontWeight: '600' },
  connectActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  connectActionText: { fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', paddingVertical: 24 },
  loadingText: { marginTop: 10, fontSize: 12 },
  emptyTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 12 },
  emptySubtitle: { fontSize: 12, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  expandBtn: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  expandBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  modalSubtitle: { fontSize: 12, lineHeight: 18, marginBottom: 16 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 12 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 10 },
  modalCancelBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  modalCancelText: { fontSize: 12, fontWeight: 'bold' },
  modalSubmitBtn: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  modalSubmitText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
});

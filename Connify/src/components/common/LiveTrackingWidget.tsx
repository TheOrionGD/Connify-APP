import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme';
import { useEpisodeStore } from '../../stores/episodeStore';
import { calculateDistanceMeters } from '../../utils/telemetry';
import { useLocationStore } from '../../stores/locationStore';

interface LiveTrackingWidgetProps {
  onPressCall?: () => void;
  onPressMap?: () => void;
  customCategory?: string;
  customEtaMinutes?: number;
}

export function LiveTrackingWidget({
  onPressCall,
  onPressMap,
  customCategory,
  customEtaMinutes,
}: LiveTrackingWidgetProps) {
  const { colors } = useTheme();
  const { responderInfo, category, currentState } = useEpisodeStore();
  const { latitude, longitude } = useLocationStore();

  const progressAnim = useRef(new Animated.Value(0.15)).current;

  // Calculate live distance and ETA
  let distanceMeters = 850; // default initial distance estimation
  if (latitude && longitude && responderInfo?.latitude && responderInfo?.longitude) {
    distanceMeters = calculateDistanceMeters(
      latitude,
      longitude,
      responderInfo.latitude,
      responderInfo.longitude
    );
  }

  // Calculate estimated arrival time in minutes (assuming ~250m / min speed)
  const calculatedEta = customEtaMinutes ?? Math.max(1, Math.ceil(distanceMeters / 250));
  const helperName = responderInfo?.helperDeviceId || 'Volunteer Responder';

  // Determine stage & progress percentage (0.15 to 0.95)
  let stageText = 'Responder on the way';
  let progressPct = 0.25;

  if (currentState === 'searching') {
    stageText = 'Broadcasting signal to nearby responders';
    progressPct = 0.15;
  } else if (responderInfo?.isEnRoute) {
    if (distanceMeters < 50) {
      stageText = 'Responder has arrived on scene!';
      progressPct = 0.95;
    } else if (distanceMeters < 300) {
      stageText = 'Responder is arriving nearby (<300m)';
      progressPct = 0.75;
    } else {
      stageText = `${helperName} is on the way (${distanceMeters}m away)`;
      progressPct = 0.50;
    }
  }

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPct,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressPct, progressAnim]);

  const targetCategory = customCategory || category || 'Emergency Request';

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.etaTitle}>
            {currentState === 'searching'
              ? 'Searching for Responders...'
              : `Arriving in ${calculatedEta} mins`}
          </Text>
          <Text style={styles.subText}>{stageText}</Text>
          <Text style={styles.locationText}>Responding to: {targetCategory}</Text>
        </View>

        {/* Small Brand Badge */}
        <View style={styles.brandBadge}>
          <Icon name="bolt" size={14} color="#F59E0B" />
          <Text style={styles.brandText}>CONNIFY LIVE</Text>
        </View>
      </View>

      {/* Visual Narrative Progress Bar Track */}
      <View style={styles.progressSection}>
        {/* Left Milestone Icon */}
        <View style={styles.milestoneBadge}>
          <Icon name="local-police" size={20} color="#F59E0B" />
        </View>

        {/* Track Bar Background */}
        <View style={styles.trackBackground}>
          <Animated.View
            style={[
              styles.trackFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />

          {/* Sliding Responder Icon */}
          <Animated.View
            style={[
              styles.responderVehiclePin,
              {
                left: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '92%'],
                }),
              },
            ]}
          >
            <View style={styles.vehicleCircle}>
              <Icon name="two-wheeler" size={14} color="#FFFFFF" />
            </View>
          </Animated.View>
        </View>

        {/* Right Milestone Icon (Destination) */}
        <View style={styles.milestoneBadgeDestination}>
          <Icon name="home" size={20} color="#EF4444" />
        </View>
      </View>

      {/* Interactive Action Buttons */}
      <View style={styles.actionRow}>
        {onPressCall && (
          <TouchableOpacity style={styles.callButton} onPress={onPressCall} activeOpacity={0.8}>
            <Icon name="phone" size={16} color="#FFFFFF" />
            <Text style={styles.actionTextWhite}>CALL RESPONDER</Text>
          </TouchableOpacity>
        )}

        {onPressMap && (
          <TouchableOpacity style={styles.mapButton} onPress={onPressMap} activeOpacity={0.8}>
            <Icon name="map" size={16} color="#F59E0B" />
            <Text style={styles.actionTextGold}>LIVE MAP</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleColumn: {
    flex: 1,
  },
  etaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  subText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4,
    fontWeight: '600',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    gap: 4,
  },
  brandText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  milestoneBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneBadgeDestination: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    position: 'relative',
    justifyContent: 'center',
  },
  trackFill: {
    height: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  responderVehiclePin: {
    position: 'absolute',
    top: -8,
  },
  vehicleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionTextWhite: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionTextGold: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

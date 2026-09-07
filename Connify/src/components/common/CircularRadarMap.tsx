/**
 * CircularRadarMap — Interactive circular GPS telemetry map showing relative positions
 * of Requester (Center) and Responder (Positioned by Bearing Angle & Radius).
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, useTheme } from '../../theme';
import { TransportMode, calculateDistanceMeters, calculateBearingDegrees, calculateETA } from '../../utils/telemetry';

interface CircularRadarMapProps {
  requesterLat: number;
  requesterLng: number;
  responderLat: number;
  responderLng: number;
  transportMode?: TransportMode;
  onToggleTransportMode?: (newMode: TransportMode) => void;
  title?: string;
}

export const CircularRadarMap: React.FC<CircularRadarMapProps> = ({
  requesterLat,
  requesterLng,
  responderLat,
  responderLng,
  transportMode = 'walking',
  onToggleTransportMode,
  title = 'LIVE MESH TELEMETRY RADAR',
}) => {
  const { colors, themeMode } = useTheme();
  const isDarkMode = themeMode === 'dark';
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  }, [pulse]);

  // Calculate distance, bearing angle and ETA
  const distMeters = calculateDistanceMeters(requesterLat, requesterLng, responderLat, responderLng);
  const bearing = calculateBearingDegrees(requesterLat, requesterLng, responderLat, responderLng);
  const { etaStr } = calculateETA(distMeters, transportMode);

  // Position the responder dot on a 150px diameter circle (radius = 55px)
  const radarRadius = 55;
  const radians = ((bearing - 90) * Math.PI) / 180;
  const responderX = Math.round(radarRadius * Math.cos(radians));
  const responderY = Math.round(radarRadius * Math.sin(radians));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.8 }],
    opacity: 1 - pulse.value,
  }));

  const htmlContent = useMemo<string>((): string => {
    const tileUrl = isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    const bgColor = isDarkMode ? '#050811' : '#F8FAFC';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: ${bgColor};
          }
          .leaflet-control-container { display: none !important; }
          .pulse-requester {
            width: 16px;
            height: 16px;
            background: #ef4444;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.9);
          }
          .pulse-responder {
            width: 16px;
            height: 16px;
            background: #10b981;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.9);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const reqLat = ${requesterLat};
          const reqLng = ${requesterLng};
          const respLat = ${responderLat};
          const respLng = ${responderLng};

          const map = L.map('map', {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            touchZoom: false,
            doubleClickZoom: false,
            scrollWheelZoom: false
          });

          L.tileLayer('${tileUrl}', {
            maxZoom: 19
          }).addTo(map);

          const reqIcon = L.divIcon({ className: 'pulse-requester', iconSize: [16, 16], iconAnchor: [8, 8] });
          const respIcon = L.divIcon({ className: 'pulse-responder', iconSize: [16, 16], iconAnchor: [8, 8] });

          L.marker([reqLat, reqLng], { icon: reqIcon }).addTo(map);
          L.marker([respLat, respLng], { icon: respIcon }).addTo(map);

          L.polyline([[reqLat, reqLng], [respLat, respLng]], {
            color: '#34d399',
            weight: 2.5,
            dashArray: '5, 5'
          }).addTo(map);

          const bounds = L.latLngBounds([[reqLat, reqLng], [respLat, respLng]]);
          map.fitBounds(bounds, { padding: [20, 20], maxZoom: 17 });
        </script>
      </body>
      </html>
    `;
  }, [requesterLat, requesterLng, responderLat, responderLng, isDarkMode]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Icon name="radar" size={18} color="#EF4444" />
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>{title}</Text>
        </View>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>GPS TELEMETRY</Text>
        </View>
      </View>

      {/* Main Circular Radar Container with Embedded Leaflet Map */}
      <View style={[styles.radarContainer, { backgroundColor: isDarkMode ? '#050811' : '#F1F5F9' }]}>
        {/* Leaflet Map Tiles Canvas */}
        <View style={styles.mapCanvasWrapper}>
          {Platform.OS === 'web' ? (
            <iframe
              srcDoc={htmlContent}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Circular Radar Map"
            />
          ) : (
            <WebView
              originWhitelist={['*']}
              source={{ html: htmlContent }}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              scrollEnabled={false}
              onError={() => {}}
            />
          )}
        </View>

        {/* Animated Radar Pulse Rings */}
        <Animated.View style={[styles.pulseCircle, pulseStyle]} pointerEvents="none" />
        <View style={styles.radarOuterRing} pointerEvents="none" />
        <View style={[styles.radarInnerRing, { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(15, 23, 42, 0.15)' }]} pointerEvents="none" />

        {/* Crosshair Lines */}
        <View style={[styles.crosshairH, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.12)' }]} pointerEvents="none" />
        <View style={[styles.crosshairV, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.12)' }]} pointerEvents="none" />

        {/* Requester Pin (Always at Center) */}
        <View style={styles.requesterCenterPin} pointerEvents="none">
          <Icon name="person-pin-circle" size={26} color="#EF4444" />
          <Text style={styles.pinLabelText}>YOU</Text>
        </View>

        {/* Responder Pin (Positioned dynamically by bearing angle) */}
        <View
          style={[
            styles.responderPin,
            {
              transform: [
                { translateX: responderX },
                { translateY: responderY },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.responderDot}>
            <Icon name={transportMode === 'vehicle' ? 'directions-car' : 'directions-walk'} size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.responderLabel}>RESPONDER</Text>
        </View>
      </View>

      {/* Telemetry Metrics & Transport Mode Selector */}
      <View style={[styles.metricsContainer, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline }]}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>DISTANCE</Text>
          <Text style={[styles.metricValue, { color: colors.onBackground }]}>
            {distMeters < 50 ? '📍 On Scene (<50m)' : `~${distMeters} meters`}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>ESTIMATED ETA</Text>
          <Text style={[styles.metricValue, { color: '#10B981' }]}>{etaStr}</Text>
        </View>
      </View>

      {/* Transport Mode Switcher (Walking vs Vehicle) */}
      {onToggleTransportMode && (
        <View style={styles.transportSwitchContainer}>
          <Text style={[styles.switchLabel, { color: colors.onSurfaceVariant }]}>RESPONDER TRANSPORT MODE:</Text>
          <View style={styles.switchRow}>
            <TouchableOpacity
              style={[
                styles.modeBtn,
                { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline },
                transportMode === 'walking' ? styles.modeBtnActive : null,
              ]}
              onPress={() => onToggleTransportMode('walking')}
            >
              <Icon name="directions-walk" size={16} color={transportMode === 'walking' ? '#FFFFFF' : colors.onSurfaceVariant} />
              <Text style={[styles.modeBtnText, { color: colors.onSurfaceVariant }, transportMode === 'walking' ? styles.modeBtnTextActive : null]}>
                WALKING (~5km/h)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeBtn,
                { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline },
                transportMode === 'vehicle' ? styles.modeBtnActive : null,
              ]}
              onPress={() => onToggleTransportMode('vehicle')}
            >
              <Icon name="directions-car" size={16} color={transportMode === 'vehicle' ? '#FFFFFF' : colors.onSurfaceVariant} />
              <Text style={[styles.modeBtnText, { color: colors.onSurfaceVariant }, transportMode === 'vehicle' ? styles.modeBtnTextActive : null]}>
                VEHICLE (~30km/h)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A0F1D',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  liveBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 9,
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  radarContainer: {
    width: 170,
    height: 170,
    borderRadius: 85,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
    backgroundColor: '#050811',
  },
  mapCanvasWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 85,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  pulseCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  radarOuterRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderStyle: 'dashed',
  },
  radarInnerRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  crosshairH: {
    position: 'absolute',
    width: 150,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  crosshairV: {
    position: 'absolute',
    height: 150,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  requesterCenterPin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  pinLabelText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 9,
    color: '#FFFFFF',
    backgroundColor: '#DC2626',
    paddingHorizontal: 4,
    borderRadius: 4,
    marginTop: -4,
  },
  responderPin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  responderDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  responderLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 8,
    color: '#FFFFFF',
    backgroundColor: '#059669',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  metricsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricItem: {
    alignItems: 'center',
    gap: 2,
  },
  metricLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 9,
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  metricValue: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  transportSwitchContainer: {
    width: '100%',
    gap: 6,
    marginTop: 2,
  },
  switchLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 9,
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  switchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#10B981',
  },
  modeBtnText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: '#94A3B8',
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
});

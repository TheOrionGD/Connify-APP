import React, { useRef, useMemo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../theme';

export interface MapMarkerItem {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
  urgency: number;
  distance?: string;
  details?: string;
}

interface LeafletMapViewProps {
  userLatitude: number;
  userLongitude: number;
  requests?: MapMarkerItem[];
  radiusMeters?: number;
  onSelectRequest?: (requestId: string) => void;
  height?: number;
}

export default function LeafletMapView({
  userLatitude,
  userLongitude,
  requests = [],
  radiusMeters = 5000,
  onSelectRequest,
  height = 280,
}: LeafletMapViewProps) {
  const webViewRef = useRef<any>(null);
  const { themeMode, colors } = useTheme();
  const isDarkMode = themeMode === 'dark';

  const htmlContent = useMemo(() => {
    const validRequests = requests.filter(r => typeof r.latitude === 'number' && typeof r.longitude === 'number' && r.latitude !== 0 && r.longitude !== 0);
    const markersJson = JSON.stringify(validRequests);
    const bgColor = isDarkMode ? '#0F172A' : '#F8FAFC';
    const tileUrl = isDarkMode 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

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
          .custom-user-marker {
            width: 22px;
            height: 22px;
            background: #2563EB;
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 0 14px rgba(37, 99, 235, 0.9);
            animation: pulse-blue 1.5s infinite;
          }
          @keyframes pulse-blue {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
            70% { transform: scale(1.15); box-shadow: 0 0 0 12px rgba(37, 99, 235, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
          }
          .custom-request-marker {
            width: 24px;
            height: 24px;
            background: #DC2626;
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 0 14px rgba(220, 38, 38, 0.9);
            animation: pulse-red 1.2s infinite;
            cursor: pointer;
          }
          @keyframes pulse-red {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.8); }
            70% { transform: scale(1.15); box-shadow: 0 0 0 14px rgba(220, 38, 38, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
          }
          .leaflet-popup-content-wrapper {
            background: ${isDarkMode ? '#1E293B' : '#FFFFFF'};
            color: ${isDarkMode ? '#FFFFFF' : '#0F172A'};
            border-radius: 10px;
            font-family: sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .leaflet-popup-tip {
            background: ${isDarkMode ? '#1E293B' : '#FFFFFF'};
          }
          .popup-btn {
            background: #DC2626;
            color: white;
            border: none;
            padding: 7px 12px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 8px;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const userLat = (${userLatitude} && ${userLatitude} !== 0) ? ${userLatitude} : 10.7905;
          const userLng = (${userLongitude} && ${userLongitude} !== 0) ? ${userLongitude} : 78.7047;
          const radius = ${radiusMeters};
          const requests = ${markersJson};

          const map = L.map('map', {
            center: [userLat, userLng],
            zoom: 14,
            zoomControl: false
          });

          L.tileLayer('${tileUrl}', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
          }).addTo(map);

          // Force map container size recalculation after WebView/DOM render
          setTimeout(() => {
            map.invalidateSize();
            map.setView([userLat, userLng], 14);
          }, 300);

          window.addEventListener('resize', () => {
            map.invalidateSize();
          });

          // User Pinpoint Location Marker (Centered at userLat, userLng)
          const userIcon = L.divIcon({
            className: 'custom-user-marker',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
            .bindPopup('<b>Your Live GPS Location</b><br/>Lat: ' + userLat.toFixed(4) + ', Lng: ' + userLng.toFixed(4));

          // Guard Radius Circle
          L.circle([userLat, userLng], {
            color: '#2563EB',
            fillColor: '#3B82F6',
            fillOpacity: 0.12,
            radius: radius
          }).addTo(map);

          // Render Request Markers
          requests.forEach(req => {
            if (req.latitude && req.longitude) {
              const reqIcon = L.divIcon({
                className: 'custom-request-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });
              const marker = L.marker([req.latitude, req.longitude], { icon: reqIcon }).addTo(map);
              
              const popupContent = \`
                <div style="text-align: center; padding: 4px;">
                  <b style="color: #DC2626;">\${req.category || 'Emergency Alert'}</b><br/>
                  <span style="font-size: 11px; opacity: 0.8;">Urgency Level \${req.urgency || 3}</span><br/>
                  <button class="popup-btn" onclick="sendSelect('\${req.id}')">Offer Support</button>
                </div>
              \`;
              marker.bindPopup(popupContent);
            }
          });

          function sendSelect(id) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_REQUEST', id: id }));
            } else if (window.parent) {
              window.parent.postMessage(JSON.stringify({ type: 'SELECT_REQUEST', id: id }), '*');
            }
          }
        </script>
      </body>
      </html>
    `;
  }, [userLatitude, userLongitude, radiusMeters, requests, isDarkMode]);

  const handleMessage = (event: any) => {
    try {
      const data = typeof event.nativeEvent.data === 'string' ? JSON.parse(event.nativeEvent.data) : event.nativeEvent.data;
      if (data.type === 'SELECT_REQUEST' && data.id && onSelectRequest) {
        onSelectRequest(data.id);
      }
    } catch (e) {
      // Ignore
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height, borderColor: colors.outline }]}>
        <iframe
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 16 }}
          title="Leaflet Map"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height, borderColor: colors.outline }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={[styles.webView, { backgroundColor: colors.surfaceContainerLowest }]}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        onError={() => console.warn('[LeafletMapView] WebView error')}
        onHttpError={() => console.warn('[LeafletMapView] WebView HTTP error')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    marginVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  webView: {
    flex: 1,
  },
});


import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { StandardButton } from '../../components/buttons/StandardButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useEpisodeStore } from '../../stores/episodeStore';
import { episodeApi } from '../../services/api/episodeApi';

export default function SearchingScreen({ navigation }: any) {
  const radarAnim = useRef(new Animated.Value(0)).current;
  const { currentState, episodeId, activateEpisode, cancelRequest } = useEpisodeStore();

  // Redirect if state changes to active or idle (canceled) externally
  useEffect(() => {
    if (currentState === 'active' || currentState === 'idle') {
      navigation.replace('Main');
    }
  }, [currentState, navigation]);

  // Radar pulse animation
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(radarAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      })
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [radarAnim]);

  // Poll backend for episode status changes (handshake completions)
  useEffect(() => {
    let pollInterval: any;

    if (episodeId) {
      pollInterval = setInterval(async () => {
        try {
          const res = await episodeApi.getEpisode(episodeId);
          if (res.success) {
            if (res.data.status === 'active' || res.data.status === 'completed') {
              activateEpisode(`chan-${episodeId}`, 10);
            } else if (res.data.status === 'cancelled') {
              cancelRequest();
            }
          }
        } catch (err) {
          console.warn('⚠️ Polling error:', err);
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [episodeId, activateEpisode, cancelRequest]);

  // Terminate if no helper found within 2 minutes
  useEffect(() => {
    const timer = setTimeout(() => {
      cancelRequest();
      Alert.alert('Timeout', 'No verified helpers were found in your area within 2 minutes. Please try again or seek alternative help.');
    }, 120000); // 2 minutes

    return () => clearTimeout(timer);
  }, [cancelRequest]);

  const handleCancel = () => {
    cancelRequest();
  };

  const radarScale = radarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.8],
  });

  const radarOpacity = radarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Centered AppBar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Broadcasting Safe-Signal</Text>
      </View>

      <View style={styles.container}>
        {/* Animated Radar Visual */}
        <View style={styles.radarWrapper}>
          <Animated.View
            style={[
              styles.radarRing,
              {
                transform: [{ scale: radarScale }],
                opacity: radarOpacity,
              },
            ]}
          />
          <View style={styles.radarCenter}>
            <Icon name="wifi-tethering" size={48} color="#ffffff" />
          </View>
        </View>

        {/* Searching Status Indicator */}
        <View style={styles.statusWrapper}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.statusTitle}>Searching for verified helpers...</Text>
          <Text style={styles.statusDescription}>
            Syncing local coordinates and establishing zero-trust capsules with peers within 2km.
          </Text>
        </View>

        {/* Proximity Handshake QR Code Simulation */}
        <View style={styles.qrContainer}>
          <Text style={styles.qrLabel}>SHARP PROXIMITY VERIFICATION QR DATA</Text>
          <Text style={styles.qrValue} selectable>{`connify-sharp:${episodeId}:${useEpisodeStore.getState().bchSyndromes}:${useEpisodeStore.getState().helperStringY}`}</Text>
          <Text style={styles.qrHelp}>A helper must scan this code or simulate the proximity handshake to recover the JIT capsule.</Text>
        </View>

        {/* Cancel CTA */}
        <StandardButton
          title="CANCEL REQUEST"
          variant="secondary"
          onPress={handleCancel}
          style={styles.cancelButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 64,
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.containerPadding,
    paddingVertical: 50,
  },
  radarWrapper: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 40,
  },
  radarRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(182, 1, 0, 0.1)',
  },
  qrContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.spacing.radiusDefault,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  qrLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: theme.colors.primary,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  qrValue: {
    fontFamily: theme.fontFamilies.technical.regular,
    fontSize: 11,
    textAlign: 'center',
    backgroundColor: '#1E1E1E',
    color: '#00FF00',
    padding: 8,
    borderRadius: 4,
    width: '100%',
  },
  qrHelp: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  radarCenter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  statusWrapper: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  statusTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 20,
    color: theme.colors.onBackground,
    textAlign: 'center',
    marginTop: 8,
  },
  statusDescription: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  cancelButton: {
    width: '100%',
    maxWidth: 320,
  },
});

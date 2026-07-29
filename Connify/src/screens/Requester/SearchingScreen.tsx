import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';
import { useEpisodeStore } from '../../stores/episodeStore';
import { StandardButton } from '../../components/buttons/StandardButton';

export default function SearchingScreen({ navigation }: any) {
  const [pulseAnim1] = useState(new Animated.Value(0));
  const [pulseAnim2] = useState(new Animated.Value(0));
  const { currentState, cancelRequest, category, urgency } = useEpisodeStore();

  useEffect(() => {
    const anim1 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim1, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    const anim2 = Animated.sequence([
      Animated.delay(600),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim2, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ),
    ]);

    anim1.start();
    anim2.start();

    return () => {
      anim1.stop();
      anim2.stop();
    };
  }, [pulseAnim1, pulseAnim2]);

  useEffect(() => {
    if (currentState === 'idle') {
      navigation.replace('Main');
    }
  }, [currentState, navigation]);

  const handleCancel = () => {
    cancelRequest();
    navigation.replace('Main');
  };

  const pulseScale1 = pulseAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });
  const pulseOpacity1 = pulseAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  const pulseScale2 = pulseAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 3.0],
  });
  const pulseOpacity2 = pulseAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SEARCHING FOR RESPONDERS</Text>
      </View>

      <View style={styles.content}>
        {/* Animated Multi-Ring Radar */}
        <View style={styles.radarContainer}>
          <Animated.View
            style={[
              styles.pulseCircleOuter,
              {
                transform: [{ scale: pulseScale2 }],
                opacity: pulseOpacity2,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseCircleInner,
              {
                transform: [{ scale: pulseScale1 }],
                opacity: pulseOpacity1,
              },
            ]}
          />
          <View style={styles.centerIconBox}>
            <Icon name="radar" size={54} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.statusGroup}>
          <Text style={styles.statusTitle}>Broadcasting Emergency Signal</Text>
          <Text style={styles.statusSub}>
            Transmitting anonymized location grid cell to nearby volunteer responders...
          </Text>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>CATEGORY:</Text>
            <Text style={styles.detailValue}>{(category || 'GENERAL').toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>URGENCY LEVEL:</Text>
            <Text style={styles.detailValue}>LEVEL {urgency || 3}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>STATUS:</Text>
            <Text style={styles.detailValue}>SCANNING P2P MESH...</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <StandardButton
          title="CANCEL EMERGENCY BROADCAST"
          onPress={handleCancel}
          variant="secondary"
          style={styles.cancelButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050506',
  },
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050506',
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    color: '#EF4444',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    gap: 28,
  },
  radarContainer: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseCircleOuter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  pulseCircleInner: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(220, 38, 38, 0.4)',
  },
  centerIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DC2626',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  statusGroup: {
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statusSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
    lineHeight: 21,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 320,
  },
  detailCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0E1320',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 1,
  },
  detailValue: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: '#EF4444',
  },
  bottomBar: {
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.containerPadding,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#050506',
    alignItems: 'center',
  },
  cancelButton: {
    width: '100%',
    maxWidth: 440,
  },
});

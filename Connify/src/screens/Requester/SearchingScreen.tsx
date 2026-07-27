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
  const [pulseAnim] = useState(new Animated.Value(0));
  const { currentState, cancelRequest, category, urgency } = useEpisodeStore();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (currentState === 'idle') {
      navigation.replace('Main');
    }
  }, [currentState, navigation]);

  const handleCancel = () => {
    cancelRequest();
    navigation.replace('Main');
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SEARCHING FOR RESPONDERS</Text>
      </View>

      <View style={styles.content}>
        {/* Animated Radar Circle */}
        <View style={styles.radarContainer}>
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
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
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 56,
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    color: theme.colors.onBackground,
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
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary,
  },
  centerIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: theme.colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusGroup: {
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 22,
    color: theme.colors.onBackground,
    textAlign: 'center',
  },
  statusSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 320,
  },
  detailCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
    padding: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  detailValue: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: theme.colors.primary,
  },
  bottomBar: {
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.containerPadding,
    borderTopWidth: theme.spacing.borderWidthHeavy,
    borderTopColor: theme.colors.outline,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  cancelButton: {
    width: '100%',
    maxWidth: 440,
  },
});

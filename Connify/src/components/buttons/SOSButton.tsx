import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { theme } from '../../theme';

interface SOSButtonProps {
  onTrigger: () => void;
  holdDurationMs?: number;
}

export const SOSButton: React.FC<SOSButtonProps> = ({
  onTrigger,
  holdDurationMs = 2000,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pulse animation loop
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handlePressIn = () => {
    // Start scale and progress animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: holdDurationMs,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: holdDurationMs,
        useNativeDriver: false,
      }),
    ]).start();

    // Start timer for trigger
    timerRef.current = setTimeout(() => {
      onTrigger();
      handlePressOut(); // Reset button state after trigger
    }, holdDurationMs);
  };

  const handlePressOut = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Reset animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Interpolate pulse style for scale & border glow
  const animatedPulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });

  const animatedPulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  // Interpolate circular indicator width based on progress
  const ringWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Outer Pulse Rings */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: animatedPulseScale }],
            opacity: animatedPulseOpacity,
          },
        ]}
      />

      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.sosButton,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Progress Overlay Ring */}
          <Animated.View
            style={[
              styles.progressIndicator,
              {
                width: ringWidth,
                height: ringWidth,
              },
            ]}
          />

          {/* Icon */}
          <Text style={styles.sosText}>SOS</Text>
          <Text style={styles.holdText}>HOLD TO TRIGGER</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 210,
    height: 210,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: theme.colors.primary,
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.colors.primary,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  progressIndicator: {
    position: 'absolute',
    borderRadius: 90,
    backgroundColor: theme.colors.primaryContainer,
    opacity: 0.3,
  },
  sosText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 54,
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  holdText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: '#ffffff',
    marginTop: 4,
    opacity: 0.9,
    letterSpacing: 0.8,
  },
});

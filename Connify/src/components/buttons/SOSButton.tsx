import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { theme } from '../../theme';
import { GradientView } from '../common/GradientView';


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
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Concentric Pulse Animation Loop
  useEffect(() => {
    const pulse1 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim1, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim1, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: false,
        }),
      ])
    );

    const pulse2 = Animated.sequence([
      Animated.delay(600),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim2, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim2, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: false,
          }),
        ])
      ),
    ]);

    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulse1.start();
    pulse2.start();
    breathe.start();

    return () => {
      pulse1.stop();
      pulse2.stop();
      breathe.stop();
    };
  }, [pulseAnim1, pulseAnim2, breatheAnim]);


  const handlePressIn = () => {
    // Start scale and progress animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.12,
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

  // Concentric Ring Interpolations
  const pulseScale1 = pulseAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35],
  });
  const pulseOpacity1 = pulseAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  const pulseScale2 = pulseAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });
  const pulseOpacity2 = pulseAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  // Interpolate circular indicator width based on progress
  const ringWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Outer Pulse Ring 2 */}
      <Animated.View
        style={[
          styles.pulseRingOuter,
          {
            transform: [{ scale: pulseScale2 }],
            opacity: pulseOpacity2,
          },
        ]}
      />

      {/* Outer Pulse Ring 1 */}
      <Animated.View
        style={[
          styles.pulseRingInner,
          {
            transform: [{ scale: pulseScale1 }],
            opacity: pulseOpacity1,
          },
        ]}
      />

      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.sosButtonContainer,
            { transform: [{ scale: Animated.multiply(scaleAnim, breatheAnim) }] },
          ]}
        >
          <GradientView
            colors={['#EF4444', '#991B1B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sosButtonGradient}
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

            {/* Icon / Content */}
            <Text style={styles.sosText}>SOS</Text>
            <View style={styles.holdBadge}>
              <Text style={styles.holdText}>HOLD TO TRIGGER</Text>
            </View>
          </GradientView>
        </Animated.View>
      </TouchableWithoutFeedback>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseRingOuter: {
    position: 'absolute',
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  pulseRingInner: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(220, 38, 38, 0.4)',
  },
  sosButtonContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    elevation: 16,
    boxShadow: '0px 8px 20px rgba(220, 38, 38, 0.65)',
    backgroundColor: '#991B1B', // Fallback
  },
  sosButtonGradient: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressIndicator: {

    position: 'absolute',
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  sosText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 52,
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  holdBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  holdText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});

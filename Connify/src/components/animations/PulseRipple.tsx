import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

interface PulseRippleProps {
  color?: string;
  size?: number;
  duration?: number;
  delay?: number;
  scale?: number;
}

const PulseRipple: React.FC<PulseRippleProps> = ({
  color = '#007AFF', // Default iOS blue, can be overridden
  size = 100,
  duration = 2000,
  delay = 0,
  scale = 2.5,
}) => {
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.out(Easing.ease),
        }),
        -1,
        false
      )
    );
  }, [duration, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animation.value, [0, 1], [0.8, 0]),
      transform: [
        {
          scale: interpolate(animation.value, [0, 1], [1, scale]),
        },
      ],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.ripple,
          {
            backgroundColor: color,
            borderRadius: size / 2,
            width: size,
            height: size,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
  },
});

export default PulseRipple;

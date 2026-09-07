import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface ShieldCapsuleProps {
  color?: string;
  size?: number;
  duration?: number;
  strokeWidth?: number;
  delay?: number;
  isDrawing?: boolean;
}

const ShieldCapsule: React.FC<ShieldCapsuleProps> = ({
  color = '#0A84FF', // Default tech blue
  size = 120,
  duration = 1500,
  strokeWidth = 4,
  delay = 0,
  isDrawing = true,
}) => {
  const progress = useSharedValue(0);

  // Simple shield path
  // Start top middle, curve down right, down to point, up left, curve up right to start
  const SHIELD_PATH = "M 50 10 Q 90 10 90 40 Q 90 80 50 100 Q 10 80 10 40 Q 10 10 50 10 Z";
  const PATH_LENGTH = 300; // Approximate length of the path

  useEffect(() => {
    if (isDrawing) {
      progress.value = 0;
      progress.value = withDelay(
        delay,
        withTiming(1, {
          duration,
          easing: Easing.inOut(Easing.ease),
        })
      );
    } else {
      progress.value = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawing, duration, delay]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: PATH_LENGTH - progress.value * PATH_LENGTH,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 110">
        <AnimatedPath
          d={SHIELD_PATH}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={PATH_LENGTH}
          animatedProps={animatedProps}
        />
        <AnimatedPath
          d={SHIELD_PATH}
          stroke={color}
          strokeWidth={0}
          fill={color}
          opacity={0.15}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShieldCapsule;

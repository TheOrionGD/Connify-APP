import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface SignalParticleProps {
  delay: number;
  color: string;
  duration: number;
}

const SignalParticle: React.FC<SignalParticleProps> = ({ delay, color, duration }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        false
      )
    );
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [-50, width / 2]);
    const opacity = interpolate(progress.value, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [0.5, 1.2, 0.5]);

    return {
      opacity,
      transform: [{ translateX }, { scale }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
};

interface SignalFlowProps {
  color?: string;
  particleCount?: number;
  duration?: number;
}

const SignalFlow: React.FC<SignalFlowProps> = ({
  color = '#4CD964', // Default success green
  particleCount = 5,
  duration = 2000,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: particleCount }).map((_, index) => (
        <SignalParticle
          key={index}
          delay={(duration / particleCount) * index}
          color={color}
          duration={duration}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  particle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    left: 0,
  },
});

export default SignalFlow;

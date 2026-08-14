import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  withDelay,
  withSequence,
} from 'react-native-reanimated';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface NodeConnectionProps {
  color?: string;
  nodeSize?: number;
  duration?: number;
  isConnected?: boolean;
}

const NodeConnection: React.FC<NodeConnectionProps> = ({
  color = '#4CD964',
  nodeSize = 20,
  duration = 1500,
  isConnected = false,
}) => {
  const lineProgress = useSharedValue(0);
  const leftNodeScale = useSharedValue(1);
  const rightNodeScale = useSharedValue(1);
  const dataFlowProgress = useSharedValue(0);

  const containerWidth = 200;
  const lineLength = containerWidth - nodeSize * 2 - 20;

  useEffect(() => {
    if (isConnected) {
      // 1. Left node pulses
      leftNodeScale.value = withSequence(
        withTiming(1.3, { duration: 300 }),
        withTiming(1, { duration: 300 })
      );

      // 2. Line draws from left to right
      lineProgress.value = withDelay(
        400,
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      );

      // 3. Right node pulses upon connection
      rightNodeScale.value = withDelay(
        1200,
        withSequence(
          withTiming(1.3, { duration: 300 }),
          withTiming(1, { duration: 300 })
        )
      );

      // 4. Data starts flowing
      dataFlowProgress.value = withDelay(
        1500,
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.linear }),
          withTiming(0, { duration: 0 }),
          withTiming(1, { duration: 600, easing: Easing.linear })
        ) // We could use withRepeat here but sticking to sequence for single trigger
      );
    } else {
      lineProgress.value = 0;
      leftNodeScale.value = 1;
      rightNodeScale.value = 1;
      dataFlowProgress.value = 0;
    }
  }, [isConnected]);

  const animatedLineProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: lineLength - lineProgress.value * lineLength,
    };
  });

  const animatedLeftNodeProps = useAnimatedProps(() => {
    return {
      r: (nodeSize / 2) * leftNodeScale.value,
    };
  });

  const animatedRightNodeProps = useAnimatedProps(() => {
    return {
      r: (nodeSize / 2) * rightNodeScale.value,
    };
  });

  return (
    <View style={[styles.container, { width: containerWidth }]}>
      <Svg width="100%" height={nodeSize * 2}>
        <AnimatedLine
          x1={nodeSize + 10}
          y1={nodeSize}
          x2={containerWidth - nodeSize - 10}
          y2={nodeSize}
          stroke={color}
          strokeWidth="3"
          strokeDasharray={lineLength}
          animatedProps={animatedLineProps}
          strokeLinecap="round"
        />
        
        <AnimatedCircle
          cx={nodeSize / 2 + 5}
          cy={nodeSize}
          fill={color}
          animatedProps={animatedLeftNodeProps}
        />
        
        <AnimatedCircle
          cx={containerWidth - nodeSize / 2 - 5}
          cy={nodeSize}
          fill={color}
          animatedProps={animatedRightNodeProps}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NodeConnection;

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

interface QuickSOSCardProps {
  onPress: () => void;
}

/**
 * Premium "Customize Your Quick SOS" CTA card.
 *
 * Visual features matched from the reference image:
 *  - Coral-to-crimson horizontal gradient background
 *  - Shield + medical cross icon on the left with concentric ripple rings
 *  - Decorative dot-grid in the bottom-left corner
 *  - Subtle top-half gloss overlay for depth
 *  - Dark semi-transparent circular arrow button on the right
 *  - White bold title + lighter subtitle
 */
const QuickSOSCard: React.FC<QuickSOSCardProps> = ({ onPress }) => {
  // Slow pulsing animation for the outer ripple rings
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withDelay(
        200,
        withTiming(1, { duration: 3000, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    );
  }, [pulse]);

  const ring1Style = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 0.5, 1], [0.18, 0.08, 0.18]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.08]) }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 0.5, 1], [0.12, 0.05, 0.12]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.05]) }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.cardWrapper}
    >
      <View style={styles.card}>
        {/* ───── Background gradient (coral → crimson) ───── */}
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="bgGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <Stop offset="0%" stopColor="#F87171" stopOpacity="1" />
              <Stop offset="35%" stopColor="#EF4444" stopOpacity="1" />
              <Stop offset="100%" stopColor="#DC2626" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bgGrad)" />
        </Svg>

        {/* ───── Decorative dot-grid (bottom-left) ───── */}
        <View style={styles.dotGridContainer}>
          <Svg width={60} height={60} viewBox="0 0 60 60">
            {Array.from({ length: 5 }).map((_, row) =>
              Array.from({ length: 5 }).map((__, col) => (
                <Circle
                  key={`dot-${row}-${col}`}
                  cx={6 + col * 12}
                  cy={6 + row * 12}
                  r={1.8}
                  fill="rgba(255,255,255,0.2)"
                />
              ))
            )}
          </Svg>
        </View>

        {/* ───── Gloss overlay (top half sheen) ───── */}
        <Svg style={[StyleSheet.absoluteFill, { zIndex: 1 }]} pointerEvents="none">
          <Defs>
            <LinearGradient id="gloss" x1="50%" y1="0%" x2="50%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
              <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.03" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.05" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#gloss)" />
        </Svg>

        {/* ───── Content Row ───── */}
        <View style={styles.contentRow}>
          {/* LEFT: Shield icon with concentric ripple rings */}
          <View style={styles.shieldSection}>
            {/* Outer concentric rings (animated) */}
            <Animated.View style={[styles.ringOuter, ring2Style]}>
              <View style={styles.ringOuterCircle} />
            </Animated.View>
            <Animated.View style={[styles.ringMiddle, ring1Style]}>
              <View style={styles.ringMiddleCircle} />
            </Animated.View>

            {/* Shield icon (inner solid) */}
            <View style={styles.shieldIconWrapper}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2L4 5.5V11.5C4 16.19 7.41 20.56 12 22C16.59 20.56 20 16.19 20 11.5V5.5L12 2Z"
                  fill="rgba(255,255,255,0.92)"
                />
                <Path
                  d="M11 7H13V11H11V7Z"
                  fill="#EF4444"
                />
                <Path
                  d="M9 9H15V11H9V9Z"
                  fill="#EF4444"
                />
              </Svg>
            </View>
          </View>

          {/* CENTER: Title + Subtitle */}
          <View style={styles.textContent}>
            <Text style={styles.title}>Customize Your{'\n'}Quick Request</Text>
            <Text style={styles.subtitle}>
              Pre-configure custom alerts{'\n'}for faster response.
            </Text>
          </View>

          {/* RIGHT: Arrow button */}
          <View style={styles.arrowButton}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12H19M19 12L13 6M19 12L13 18"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    // Outer wrapper for the shadow (Android elevation + iOS shadow)
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    minHeight: 130,
    justifyContent: 'center',
  },
  dotGridContainer: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    zIndex: 1,
    opacity: 0.7,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    zIndex: 2,
  },
  // ── Shield icon + rings ──
  shieldSection: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  ringOuter: {
    position: 'absolute',
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringOuterCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  ringMiddle: {
    position: 'absolute',
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringMiddleCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  shieldIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  // ── Text ──
  textContent: {
    flex: 1,
    marginHorizontal: 8,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'WorkSans-Bold',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 28,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: 'WorkSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    fontStyle: 'italic',
  },
  // ── Arrow button ──
  arrowButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});

export default QuickSOSCard;

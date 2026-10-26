import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Animated, Easing, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import { API_BASE_URL } from '@env';

const LOGO_IMAGE = require('../../../assets/logo_converted.png');

export default function SplashScreen({ navigation }: any) {
  const [pulseAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // 1. Smooth branded pulsating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();

    // 2. Non-blocking asynchronous wake-up ping to Render backend
    // Runs in the background without halting the app lifecycle
    const wakeUpBackend = async () => {
      try {
        const backendUrl = API_BASE_URL || 'https://connify-backend.onrender.com';
        const fetchUrl = backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`;
        fetch(fetchUrl).catch((e) => console.log('Background wake-up notice:', e));
      } catch (err) {
        // Non-blocking
      }
    };
    wakeUpBackend();

    // 3. Fast, smooth transition into Onboarding (or Main if authenticated)
    const timer = setTimeout(() => {
      try {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          navigation.replace('Main');
        } else {
          navigation.replace('Welcome');
        }
      } catch (err) {
        console.warn('[SplashScreen] Navigation transition notice:', err);
      }
    }, 1100);

    return () => clearTimeout(timer);
  }, [navigation, pulseAnim]);

  const dotStyle = {
    opacity: pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        scale: pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.outerRing}>
            <View style={styles.innerRing}>
              <View style={styles.solidCircle}>
                <Image
                  source={LOGO_IMAGE}
                  style={styles.logoImage}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.brandTitle}>Connify</Text>
          <Text style={styles.brandSubtitle}>ZERO-TRUST SAFETY PROTOCOL</Text>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, dotStyle]} />
          <Animated.View style={[styles.dot, dotStyle]} />
          <Animated.View style={[styles.dot, dotStyle]} />
        </View>
        <Text style={styles.loaderText}>Initializing Zero-Trust Security Engine...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050506',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  outerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.25)',
    backgroundColor: 'rgba(14, 19, 32, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  innerRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0E1320',
    borderWidth: 2,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  logoImage: {
    width: 68,
    height: 68,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.6,
  },
  brandSubtitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11.5,
    letterSpacing: 2.2,
    color: '#3B82F6',
    fontWeight: '700',
  },
  bottomContainer: {
    paddingBottom: 48,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  loaderText: {
    fontFamily: theme.fontFamilies.secondary.medium,
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});

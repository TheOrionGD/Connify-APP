import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Animated, Easing, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import { API_BASE_URL } from '@env';

export default function SplashScreen({ navigation }: any) {
  const [pulseAnim] = useState(new Animated.Value(0));

  useEffect(() => {
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

    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;
    let navTimeout: NodeJS.Timeout;

    const checkBackendStatus = async () => {
      if (process.env.NODE_ENV === 'test') return;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); 
        
        const backendUrl = API_BASE_URL || 'https://connify-backend.onrender.com';
        const fetchUrl = backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`;
        const response = await fetch(fetchUrl, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && data.success) {
            if (isMounted) {
              navTimeout = setTimeout(() => {
                if (!isMounted) return;
                const { isAuthenticated } = useAuthStore.getState();
                if (isAuthenticated) {
                  navigation.replace('Main');
                } else {
                  navigation.replace('Welcome');
                }
              }, 800);
            }
            return;
          }
        }
      } catch (error) {
        console.log('Backend not awake yet or timed out, retrying in 3s...', error);
      }
      
      if (isMounted) {
        retryTimeout = setTimeout(checkBackendStatus, 3000);
      }
    };

    checkBackendStatus();

    return () => {
      isMounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
      if (navTimeout) clearTimeout(navTimeout);
    };
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
                <Icon name="security" size={54} color="#FFFFFF" />
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
        <Text style={styles.loaderText}>Establishing Secure Node Handshake...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    borderWidth: 2,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 34,
    fontWeight: '800',
    color: theme.colors.onBackground,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    letterSpacing: 2,
    color: theme.colors.primary,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  loaderText: {
    fontFamily: theme.fontFamilies.secondary.medium,
    fontSize: 13,
    color: theme.colors.onBackground,
    fontWeight: '600',
  },
});

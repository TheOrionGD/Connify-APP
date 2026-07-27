import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';
import { apiClient } from '../../services/api/apiClient';
import { useAuthStore } from '../../stores/authStore';

export default function SplashScreen({ navigation }: any) {
  const [pulseAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Pulse animation for the loader dots
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
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
        
        const response = await fetch('https://connify-backend.onrender.com/', {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          // The user specifically requested waiting for this exact success message
          if (data && data.success && data.message.includes('Zero-Trust Backend Protocol Running')) {
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
      
      // Retry after 3 seconds
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
        
        {/* Center Logo Group */}
        <View style={styles.logoContainer}>
          {/* Outer ring */}
          <View style={styles.outerRing}>
            {/* Inner ring */}
            <View style={styles.innerRing}>
              {/* Solid Red Circle */}
              <View style={styles.solidCircle}>
                <Icon name="security" size={48} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>

        {/* Text Group */}
        <View style={styles.textContainer}>
          <Text style={styles.brandTitle}>Connify</Text>
          <Text style={styles.brandSubtitle}>SAFE & COORDINATE</Text>
        </View>
      </View>

      {/* Bottom Loader */}
      <View style={styles.bottomContainer}>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, dotStyle]} />
          <Animated.View style={[styles.dot, dotStyle, { animationDelay: '200ms' } as any]} />
          <Animated.View style={[styles.dot, dotStyle, { animationDelay: '400ms' } as any]} />
        </View>
        <Text style={styles.loaderText}>Establishing Secure Protocol...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  outerRing: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(230, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(230, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#D90000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D90000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  brandSubtitle: {
    fontFamily: theme.fontFamilies.technical.medium,
    fontSize: 12,
    letterSpacing: 2,
    color: '#666666',
  },
  bottomContainer: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D90000',
  },
  loaderText: {
    fontFamily: theme.fontFamilies.secondary.medium,
    fontSize: 14,
    color: '#666666',
  },
});

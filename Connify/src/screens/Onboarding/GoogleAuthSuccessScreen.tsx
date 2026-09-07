import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';
import { useAuthStore } from '../../stores/authStore';

import { useRewardStore } from '../../stores/rewardStore';

export default function GoogleAuthSuccessScreen({ navigation }: any) {
  const { userProfile } = useAuthStore();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    useRewardStore.getState().unlockBadge('GOOGLE_AUTH');

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.back(1.5),
        useNativeDriver: true,
      }),
      Animated.timing(badgeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, badgeAnim, fadeAnim]);

  const handleContinue = () => {
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Animated Checkmark Shield */}
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.outerShield}>
            <View style={styles.innerShield}>
              {userProfile?.photo ? (
                <Image source={{ uri: userProfile.photo }} style={styles.avatarImage} />
              ) : (
                <Icon name="check-circle" size={80} color="#16A34A" />
              )}
            </View>
          </View>
        </Animated.View>

        <Text style={styles.successTitle}>Google Auth Verified!</Text>
        <Text style={styles.userName}>
          Welcome, {userProfile?.name || 'Connify Defender'}
        </Text>
        <Text style={styles.userEmail}>{userProfile?.email || 'authenticated@google.com'}</Text>

        {/* XP Reward Badge */}
        <Animated.View
          style={[
            styles.xpCard,
            {
              opacity: badgeAnim,
              transform: [
                {
                  translateY: badgeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.xpIconBadge}>
            <Icon name="military-tech" size={32} color="#EAB308" />
          </View>
          <View style={styles.xpTextContainer}>
            <Text style={styles.xpAmount}>+50 XP UNLOCKED</Text>
            <Text style={styles.xpLabel}>Verified Google Defender Badge</Text>
          </View>
        </Animated.View>

        {/* Action Button */}
        <Animated.View style={[styles.bottomContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.continueButtonText}>Enter CONNIFY Network</Text>
            <Icon name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginBottom: 24,
  },
  outerShield: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#DCFCE7',
    borderWidth: 3,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  innerShield: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  successTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  userName: {
    fontFamily: theme.fontFamilies.primary.medium,
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  userEmail: {
    fontFamily: theme.fontFamilies.technical.regular,
    fontSize: 13,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
  },
  xpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    borderWidth: 1.5,
    borderColor: '#FDE047',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    marginBottom: 40,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  xpIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF08A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  xpTextContainer: {
    flex: 1,
  },
  xpAmount: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 16,
    fontWeight: '800',
    color: '#854D0E',
    letterSpacing: 0.5,
  },
  xpLabel: {
    fontFamily: theme.fontFamilies.secondary.medium,
    fontSize: 12,
    color: '#A16207',
    fontWeight: '600',
  },
  bottomContainer: {
    width: '100%',
  },
  continueButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

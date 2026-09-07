import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRewardStore } from '../../stores/rewardStore';
import { theme } from '../../theme';

export default function RewardBadgeModal() {
  const { activeRewardModal, dismissRewardModal } = useRewardStore();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeRewardModal) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.back(1.6),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [activeRewardModal, scaleAnim, fadeAnim]);

  if (!activeRewardModal) return null;

  return (
    <Modal
      transparent
      visible={!!activeRewardModal}
      animationType="fade"
      onRequestClose={dismissRewardModal}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Badge Icon Shield */}
          <View style={[styles.badgeIconWrapper, { backgroundColor: `${activeRewardModal.color}18`, borderColor: activeRewardModal.color }]}>
            <View style={[styles.innerBadgeCircle, { backgroundColor: activeRewardModal.color }]}>
              <Icon name={activeRewardModal.iconName} size={48} color="#FFFFFF" />
            </View>
          </View>

          {/* XP Banner */}
          <View style={styles.xpBanner}>
            <Icon name="military-tech" size={20} color="#854D0E" />
            <Text style={styles.xpText}>+{activeRewardModal.xp} XP REWARD UNLOCKED!</Text>
          </View>

          <Text style={styles.badgeTitle}>{activeRewardModal.title}</Text>
          <Text style={styles.badgeDescription}>{activeRewardModal.description}</Text>

          {/* Claim Button */}
          <TouchableOpacity
            style={[styles.claimButton, { backgroundColor: activeRewardModal.color }]}
            onPress={dismissRewardModal}
            activeOpacity={0.85}
          >
            <Icon name="stars" size={20} color="#FFFFFF" />
            <Text style={styles.claimButtonText}>CLAIM BADGE REWARD</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 10, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  badgeIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  innerBadgeCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  xpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF08A',
    borderWidth: 1,
    borderColor: '#EAB308',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 14,
  },
  xpText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    fontWeight: '800',
    color: '#854D0E',
    letterSpacing: 0.5,
  },
  badgeTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDescription: {
    fontFamily: theme.fontFamilies.secondary.medium,
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  claimButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
  },
  claimButtonText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

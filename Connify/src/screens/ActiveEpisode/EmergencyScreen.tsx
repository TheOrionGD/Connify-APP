import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';
import { useEpisodeStore } from '../../stores/episodeStore';
import { StandardButton } from '../../components/buttons/StandardButton';
import { DialogueModal } from '../../components/common/DialogueModal';

export default function EmergencyScreen({ navigation }: any) {
  const {
    currentState,
    timeLeft,
    completeEpisode,
    extendTime,
    tickCountdown,
    category,
  } = useEpisodeStore();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    let timer: any;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        tickCountdown();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, tickCountdown]);

  const handleResolve = () => {
    completeEpisode();
    Alert.alert('Emergency Resolved', 'Emergency broadcast terminated. Safety lock released.');
    navigation.replace('Main');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Icon
          name="arrow-back"
          size={24}
          color="#FFFFFF"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>ACTIVE EMERGENCY MODE</Text>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Urgent Alert Banner */}
        <View style={styles.urgentCard}>
          <Icon name="warning" size={40} color="#FFFFFF" />
          <Text style={styles.urgentTitle}>BROADCAST ACTIVE</Text>
          <Text style={styles.urgentSub}>
            {(category || 'EMERGENCY').toUpperCase()} SIGNAL TRANSMITTING TO VOLUNTEER MESH
          </Text>
        </View>

        {/* Timer Box */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>SAFE TIME REMAINING</Text>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <TouchableOpacity style={styles.extendPill} onPress={() => extendTime(5)}>
            <Icon name="add-alarm" size={18} color={theme.colors.onBackground} />
            <Text style={styles.extendText}>EXTEND +5 MINUTES</Text>
          </TouchableOpacity>
        </View>

        {/* Proximity Verification Quick Action */}
        <View style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <Icon name="qr-code-scanner" size={24} color={theme.colors.primary} />
            <Text style={styles.actionTitle}>Identity Verification Handshake</Text>
          </View>
          <Text style={styles.actionSub}>
            Perform zero-trust QR or cryptographic handshake when responder arrives.
          </Text>
          <TouchableOpacity
            style={styles.handshakeButton}
            onPress={() => navigation.navigate('Handshake', { episodeId: useEpisodeStore.getState().episodeId })}
          >
            <Text style={styles.handshakeButtonText}>LAUNCH HANDSHAKE</Text>
            <Icon name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Resolve Emergency Button */}
        <StandardButton
          title="I AM SAFE — RESOLVE EMERGENCY"
          onPress={() => setModalVisible(true)}
          style={styles.resolveButton}
        />
      </ScrollView>

      <DialogueModal
        visible={modalVisible}
        title="Resolve Emergency Episode"
        message="Are you sure you want to mark yourself as safe and terminate the emergency signal broadcast?"
        onClose={() => setModalVisible(false)}
        confirmText="Confirm Safe"
        onConfirm={handleResolve}
        cancelText="Cancel"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.containerPadding,
    backgroundColor: theme.colors.primary,
    borderBottomWidth: theme.spacing.borderWidthHeavy,
    borderBottomColor: theme.colors.outline,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  liveBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: theme.colors.primary,
  },
  container: {
    padding: theme.spacing.containerPadding,
    gap: 18,
  },
  urgentCard: {
    backgroundColor: theme.colors.primary,
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusMd,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  urgentTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  urgentSub: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  timerCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthHeavy,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusMd,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  timerLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    letterSpacing: 1.2,
  },
  timerText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 44,
    color: theme.colors.onBackground,
    fontWeight: '800',
  },
  extendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderWidth: 1.5,
    borderColor: theme.colors.outline,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  extendText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: theme.colors.onBackground,
  },
  actionCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: theme.spacing.borderWidthLight,
    borderColor: theme.colors.outline,
    borderRadius: theme.spacing.radiusDefault,
    padding: 16,
    gap: 10,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 15,
    color: theme.colors.onBackground,
  },
  actionSub: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
  },
  handshakeButton: {
    backgroundColor: theme.colors.onBackground,
    paddingVertical: 12,
    borderRadius: theme.spacing.radiusDefault,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  handshakeButtonText: {
    color: '#FFFFFF',
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  resolveButton: {
    marginTop: 8,
  },
});

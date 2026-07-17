import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { StandardButton } from '../../components/buttons/StandardButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useEpisodeStore } from '../../stores/episodeStore';

export default function EmergencyScreen({ navigation }: any) {
  const { startRequest, activateEpisode } = useEpisodeStore();

  const handleEmergencyAction = () => {
    startRequest('Security', 5, 'Critical Emergency SOS triggered');
    activateEpisode('emergency-channel-911', 15); // 15 minutes for critical SOS
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EMERGENCY MODE</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.container}>
        <View style={styles.alertContent}>
          <View style={styles.iconCircle}>
            <Icon name="emergency" size={64} color="#ffffff" />
          </View>
          <Text style={styles.title}>Emergency Broadcast</Text>
          <Text style={styles.description}>
            This action will initiate immediate audio recording, broadcast your precise coordinates to nearby responders, and call local emergency services.
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <StandardButton
            title="CALL EMERGENCY SERVICES (911)"
            onPress={handleEmergencyAction}
            style={styles.callButton}
          />
          <StandardButton
            title="START AUDIO RECORDING"
            onPress={handleEmergencyAction}
            variant="secondary"
            style={styles.recordButton}
            textStyle={styles.recordText}
          />
          <StandardButton
            title="CANCEL ALARM"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary, // Red background for Emergency Mode
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.containerPadding,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: 1,
  },
  headerRight: {
    width: 32,
  },
  container: {
    flex: 1,
    padding: theme.spacing.containerPadding,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  alertContent: {
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  title: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 28,
    color: '#ffffff',
    textAlign: 'center',
  },
  description: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 15,
    lineHeight: 22,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: 16,
  },
  actionsContainer: {
    width: '100%',
    gap: 14,
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 440,
  },
  recordButton: {
    borderColor: '#ffffff',
    width: '100%',
    maxWidth: 440,
  },
  recordText: {
    color: '#ffffff',
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'transparent',
    width: '100%',
    maxWidth: 440,
  },
});

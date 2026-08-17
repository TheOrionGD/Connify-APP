import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { normalize } from '../theme/typography';

export default function FakeCallScreen() {
  const navigation = useNavigation();
  const [callState, setCallState] = useState<'incoming' | 'active'>('incoming');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'active') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDecline = () => {
    navigation.goBack();
  };

  const handleAnswer = () => {
    setCallState('active');
  };

  const handleEndCall = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.callerName}>Mom</Text>
        <Text style={styles.callStatus}>
          {callState === 'incoming' ? 'Incoming call' : formatTime(timer)}
        </Text>
      </View>

      <View style={styles.bottomSection}>
        {callState === 'incoming' ? (
          <View style={styles.actionRow}>
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity style={[styles.circleButton, styles.declineButton]} onPress={handleDecline}>
                <Icon name="call-end" size={normalize(32)} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.actionText}>Decline</Text>
            </View>
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity style={[styles.circleButton, styles.answerButton]} onPress={handleAnswer}>
                <Icon name="call" size={normalize(32)} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.actionText}>Accept</Text>
            </View>
          </View>
        ) : (
          <View style={styles.activeCallActions}>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Icon name="mic-off" size={normalize(28)} color="#FFFFFF" />
                <Text style={styles.gridText}>mute</Text>
              </View>
              <View style={styles.gridItem}>
                <Icon name="dialpad" size={normalize(28)} color="#FFFFFF" />
                <Text style={styles.gridText}>keypad</Text>
              </View>
              <View style={styles.gridItem}>
                <Icon name="volume-up" size={normalize(28)} color="#FFFFFF" />
                <Text style={styles.gridText}>speaker</Text>
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Icon name="add" size={normalize(28)} color="#FFFFFF" />
                <Text style={styles.gridText}>add call</Text>
              </View>
              <View style={styles.gridItem}>
                <Icon name="videocam" size={normalize(28)} color="#7A7A7A" />
                <Text style={styles.gridText}>FaceTime</Text>
              </View>
              <View style={styles.gridItem}>
                <Icon name="person" size={normalize(28)} color="#FFFFFF" />
                <Text style={styles.gridText}>contacts</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.circleButton, styles.declineButton, styles.endCallButton]} onPress={handleEndCall}>
              <Icon name="call-end" size={normalize(32)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    marginTop: normalize(80),
  },
  callerName: {
    fontSize: normalize(36),
    color: '#FFFFFF',
    fontWeight: '400',
    letterSpacing: 1,
  },
  callStatus: {
    fontSize: normalize(18),
    color: '#D1D1D1',
    marginTop: normalize(8),
  },
  bottomSection: {
    paddingBottom: normalize(60),
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: normalize(40),
  },
  actionButtonContainer: {
    alignItems: 'center',
  },
  circleButton: {
    width: normalize(72),
    height: normalize(72),
    borderRadius: normalize(36),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(10),
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  answerButton: {
    backgroundColor: '#34C759',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
  },
  activeCallActions: {
    width: '100%',
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '80%',
    marginBottom: normalize(30),
  },
  gridItem: {
    alignItems: 'center',
    width: normalize(80),
  },
  gridText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    marginTop: normalize(8),
  },
  endCallButton: {
    marginTop: normalize(20),
  },
});

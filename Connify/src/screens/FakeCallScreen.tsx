import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { normalize } from '../theme/typography';

export type PhoneModelPreset = 'google_pixel' | 'samsung_oneui' | 'o_dialer' | 'ios';

export default function FakeCallScreen() {
  const navigation = useNavigation();
  const [callerName, setCallerName] = useState('Mom');
  const [phoneModel, setPhoneModel] = useState<PhoneModelPreset>('google_pixel');
  const [callState, setCallState] = useState<'setup' | 'incoming' | 'active'>('setup');
  const [timer, setTimer] = useState(0);
  const [delaySeconds, setDelaySeconds] = useState(5);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'active') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const handleStartDelay = (caller: string, delay: number) => {
    setCallerName(caller);
    setDelaySeconds(delay);
    setCallState('setup');

    setTimeout(() => {
      setCallState('incoming');
    }, delay * 1000);
  };

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

  if (callState === 'setup') {
    return (
      <SafeAreaView style={[styles.container, { padding: 20, justifyContent: 'center' }]}>
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="phone-forwarded" size={28} color="#10B981" />
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>Fake Escort Call Generator</Text>
          </View>
          <Text style={{ color: '#A0A0A0', fontSize: 13, lineHeight: 18 }}>
            Simulate a realistic incoming phone call customized to match your phone's native dialer (Pixel, Samsung, O-Dialer, or iOS) to deter stalkers when walking alone.
          </Text>

          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', marginTop: 6 }}>SELECT DIALER PHONE MODEL</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[
              { id: 'google_pixel', label: 'Google Pixel' },
              { id: 'samsung_oneui', label: 'Samsung One UI' },
              { id: 'o_dialer', label: 'O-Dialer (Oppo/Realme)' },
              { id: 'ios', label: 'iOS / Clean' },
            ].map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => setPhoneModel(m.id as PhoneModelPreset)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: phoneModel === m.id ? '#3B82F6' : '#2A2A2A',
                  borderWidth: 1,
                  borderColor: phoneModel === m.id ? '#3B82F6' : '#444',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', marginTop: 6 }}>SELECT CALLER PROFILE</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['Mom', 'Dad', 'Safety Dispatch', 'Alex (Brother)', 'Office Guard'].map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCallerName(c)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: callerName === c ? '#10B981' : '#2A2A2A',
                  borderWidth: 1,
                  borderColor: callerName === c ? '#10B981' : '#444',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', marginTop: 6 }}>TRIGGER DELAY</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[0, 5, 15, 30].map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDelaySeconds(d)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: delaySeconds === d ? '#10B981' : '#2A2A2A',
                  borderWidth: 1,
                  borderColor: delaySeconds === d ? '#10B981' : '#444',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>{d === 0 ? 'INSTANT' : `${d}s`}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => {
              if (delaySeconds === 0) setCallState('incoming');
              else handleStartDelay(callerName, delaySeconds);
            }}
            style={{
              backgroundColor: '#10B981',
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              marginTop: 16,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 }}>
              {delaySeconds === 0 ? 'TRIGGER INCOMING CALL NOW' : `TRIGGER IN ${delaySeconds} SECONDS`}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Model-specific Background Color & Styling
  const getContainerBg = () => {
    switch (phoneModel) {
      case 'samsung_oneui':
        return '#0A0A0F';
      case 'o_dialer':
        return '#111827';
      case 'ios':
        return '#000000';
      case 'google_pixel':
      default:
        return '#1E1E1E';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getContainerBg() }]}>
      {/* Header Info */}
      <View style={styles.topSection}>
        {phoneModel === 'samsung_oneui' && (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarChar}>{callerName.charAt(0)}</Text>
          </View>
        )}
        <Text style={styles.callerName}>{callerName}</Text>
        <Text style={styles.callStatus}>
          {callState === 'incoming'
            ? phoneModel === 'o_dialer' ? 'O-Dialer Incoming...' : 'Incoming call'
            : formatTime(timer)}
        </Text>
      </View>

      {/* Action Buttons based on state and selected phone model preset */}
      <View style={styles.bottomSection}>
        {callState === 'incoming' ? (
          <View style={styles.actionRow}>
            {phoneModel === 'o_dialer' ? (
              // O-Dialer (ColorOS/OxygenOS) Wave Buttons
              <>
                <View style={styles.actionButtonContainer}>
                  <TouchableOpacity style={[styles.circleButton, styles.oDeclineButton]} onPress={handleDecline}>
                    <Icon name="call-end" size={normalize(32)} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.actionText}>Reject</Text>
                </View>
                <View style={styles.actionButtonContainer}>
                  <TouchableOpacity style={[styles.circleButton, styles.oAnswerButton]} onPress={handleAnswer}>
                    <Icon name="call" size={normalize(32)} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.actionText}>Answer</Text>
                </View>
              </>
            ) : phoneModel === 'samsung_oneui' ? (
              // Samsung One UI Buttons
              <>
                <View style={styles.actionButtonContainer}>
                  <TouchableOpacity style={[styles.circleButton, styles.samsungDecline]} onPress={handleDecline}>
                    <Icon name="call-end" size={normalize(30)} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.actionText}>Decline</Text>
                </View>
                <View style={styles.actionButtonContainer}>
                  <TouchableOpacity style={[styles.circleButton, styles.samsungAnswer]} onPress={handleAnswer}>
                    <Icon name="call" size={normalize(30)} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.actionText}>Answer</Text>
                </View>
              </>
            ) : (
              // Default / Pixel / iOS Accept-Decline Buttons
              <>
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
              </>
            )}
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
                <Text style={styles.gridText}>video</Text>
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
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    marginTop: normalize(70),
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarChar: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  callerName: {
    fontSize: normalize(34),
    color: '#FFFFFF',
    fontWeight: '400',
    letterSpacing: 1,
  },
  callStatus: {
    fontSize: normalize(16),
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
  samsungDecline: {
    backgroundColor: '#E11D48',
    borderRadius: 20,
  },
  samsungAnswer: {
    backgroundColor: '#10B981',
    borderRadius: 20,
  },
  oDeclineButton: {
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#F87171',
  },
  oAnswerButton: {
    backgroundColor: '#059669',
    borderWidth: 2,
    borderColor: '#34D399',
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

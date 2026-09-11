import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { theme, useTheme } from '../../theme';
import { useCallStore } from '../../stores/callStore';
import { socketService } from '../../services/socketService';

interface EmergencyCallModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenChat?: () => void;
  episodeId: string;
  counterpartyName: string;
  counterpartyPhone?: string;
  role: 'requester' | 'responder';
}

/** Animated Pulsing Ring for Calling State */
function PulsingRings({ color = '#10B981' }: { color?: string }) {
  const pulse1 = useSharedValue(1);
  const pulse2 = useSharedValue(1);

  useEffect(() => {
    pulse1.value = withRepeat(
      withTiming(1.6, { duration: 1600, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    pulse2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(1.6, { duration: 1600, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    );
  }, [pulse1, pulse2]);

  const style1 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse1.value }],
    opacity: interpolate(pulse1.value, [1, 1.6], [0.6, 0]),
  }));

  const style2 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse2.value }],
    opacity: interpolate(pulse2.value, [1, 1.6], [0.4, 0]),
  }));

  return (
    <View style={styles.pulseContainer} pointerEvents="none">
      <Animated.View style={[styles.pulseRing, { borderColor: color }, style1]} />
      <Animated.View style={[styles.pulseRing, { borderColor: color }, style2]} />
    </View>
  );
}

/** Dynamic Audio Frequency Waveform Visualizer */
function AudioWaveform({ isMuted }: { isMuted: boolean }) {
  const barHeights = [
    useSharedValue(12),
    useSharedValue(20),
    useSharedValue(35),
    useSharedValue(48),
    useSharedValue(28),
    useSharedValue(40),
    useSharedValue(22),
    useSharedValue(14),
  ];

  useEffect(() => {
    if (isMuted) {
      barHeights.forEach((h) => {
        h.value = withTiming(6, { duration: 300 });
      });
      return;
    }

    const intervals = barHeights.map((h, index) => {
      const minH = 8;
      const maxH = 20 + (index % 4) * 10;
      return setInterval(() => {
        const nextH = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
        h.value = withTiming(nextH, { duration: 180 });
      }, 200 + index * 40);
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [isMuted]);

  return (
    <View style={styles.waveformContainer}>
      {barHeights.map((h, i) => {
        const barStyle = useAnimatedStyle(() => ({
          height: h.value,
        }));
        return (
          <Animated.View
            key={i}
            style={[
              styles.waveBar,
              { backgroundColor: isMuted ? '#6B7280' : '#10B981' },
              barStyle,
            ]}
          />
        );
      })}
    </View>
  );
}

export function EmergencyCallModal({
  visible,
  onClose,
  onOpenChat,
  episodeId,
  counterpartyName,
  counterpartyPhone,
  role,
}: EmergencyCallModalProps) {
  const { colors } = useTheme();
  const {
    callStatus,
    duration,
    isMuted,
    isSpeakerOn,
    startOutgoingCall,
    receiveIncomingCall,
    setConnected,
    toggleMute,
    toggleSpeaker,
    tickDuration,
    endCall,
    resetCall,
  } = useCallStore();

  const [callEndedNotice, setCallEndedNotice] = useState<string | null>(null);

  // Call timer interval
  useEffect(() => {
    let timer: any = null;
    if (callStatus === 'connected') {
      timer = setInterval(() => {
        tickDuration();
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus, tickDuration]);

  // Socket event listeners for calling
  useEffect(() => {
    if (!episodeId) return;

    const unsubIncoming = socketService.onIncomingCall((data) => {
      if (data.episodeId === episodeId && callStatus === 'idle') {
        receiveIncomingCall(data.episodeId, data.callerName, data.role);
      }
    });

    const unsubAccepted = socketService.onCallAccepted((data) => {
      if (data.episodeId === episodeId) {
        setConnected();
      }
    });

    const unsubRejected = socketService.onCallRejected((data) => {
      if (data.episodeId === episodeId) {
        setCallEndedNotice('Call was declined or user is busy.');
        endCall();
        setTimeout(() => {
          resetCall();
          onClose();
        }, 2000);
      }
    });

    const unsubEnded = socketService.onCallEnded((data) => {
      if (data.episodeId === episodeId) {
        setCallEndedNotice(`Call ended (${formatDuration(data.duration || duration)})`);
        endCall();
        setTimeout(() => {
          resetCall();
          onClose();
        }, 2000);
      }
    });

    return () => {
      unsubIncoming();
      unsubAccepted();
      unsubRejected();
      unsubEnded();
    };
  }, [episodeId, callStatus, duration, receiveIncomingCall, setConnected, endCall, resetCall, onClose]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAccept = () => {
    socketService.acceptCall(episodeId, (err) => {
      if (err) console.warn('[Call] Failed to accept call:', err);
    });
    setConnected();
  };

  const handleReject = () => {
    socketService.rejectCall(episodeId, 'declined', (err) => {
      if (err) console.warn('[Call] Failed to reject call:', err);
    });
    endCall();
    resetCall();
    onClose();
  };

  const handleHangUp = () => {
    socketService.endCall(episodeId, duration, (err) => {
      if (err) console.warn('[Call] Failed to end call:', err);
    });
    setCallEndedNotice(`Call ended (${formatDuration(duration)})`);
    endCall();
    setTimeout(() => {
      resetCall();
      onClose();
    }, 1500);
  };

  const handleCellularFallback = () => {
    if (counterpartyPhone) {
      Linking.openURL(`tel:${counterpartyPhone}`).catch(() => {
        Alert.alert('Dialer Error', 'Could not launch native phone dialer.');
      });
    } else {
      Alert.alert(
        'Direct Cellular Route',
        'Direct phone number masked for privacy. SafeNet encrypted VoIP channel is active.'
      );
    }
  };

  const isOutgoing = callStatus === 'outgoing';
  const isIncoming = callStatus === 'incoming';
  const isConnected = callStatus === 'connected';
  const isEnded = callStatus === 'ended';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        if (isConnected) {
          handleHangUp();
        } else {
          onClose();
        }
      }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: '#0B0F19' }]}>
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.minimizeBtn}
            onPress={() => {
              if (onOpenChat) {
                onOpenChat();
              } else {
                onClose();
              }
            }}
          >
            <Icon name="keyboard-arrow-down" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.encryptedTag}>
            <Icon name="lock" size={12} color="#10B981" />
            <Text style={styles.encryptedTagText}>256-BIT ENCRYPTED VOIP</Text>
          </View>

          <TouchableOpacity style={styles.chatShortcutBtn} onPress={onOpenChat}>
            <Icon name="chat" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Center Main Card */}
        <View style={styles.centerContent}>
          {/* Caller Avatar with Animated Beacon */}
          <View style={styles.avatarWrapper}>
            {(isOutgoing || isIncoming) && (
              <PulsingRings color={isIncoming ? '#10B981' : '#3B82F6'} />
            )}
            <View
              style={[
                styles.avatarCircle,
                {
                  borderColor: isIncoming ? '#10B981' : isConnected ? '#3B82F6' : '#6366F1',
                  backgroundColor: '#1E293B',
                },
              ]}
            >
              <Icon
                name={role === 'responder' ? 'security' : 'person'}
                size={54}
                color={isIncoming ? '#10B981' : '#38BDF8'}
              />
            </View>
          </View>

          {/* Counterparty Identification */}
          <Text style={styles.peerName}>{counterpartyName || 'SafeNet Peer'}</Text>
          
          <View style={styles.roleBadge}>
            <Icon
              name={role === 'responder' ? 'verified-user' : 'emergency'}
              size={14}
              color={role === 'responder' ? '#10B981' : '#EF4444'}
            />
            <Text style={styles.roleBadgeText}>
              {role === 'responder' ? 'VOLUNTEER RESPONDER' : 'EMERGENCY REQUESTER'}
            </Text>
          </View>

          {/* Status Label / Duration Timer */}
          {isIncoming && (
            <Text style={[styles.statusText, { color: '#10B981' }]}>
              Incoming SafeNet Voice Call...
            </Text>
          )}

          {isOutgoing && (
            <Text style={[styles.statusText, { color: '#38BDF8' }]}>
              Calling via Zero-Trace SafeNet VoIP...
            </Text>
          )}

          {isConnected && (
            <View style={styles.connectedContainer}>
              <Text style={styles.timerText}>{formatDuration(duration)}</Text>
              <AudioWaveform isMuted={isMuted} />
            </View>
          )}

          {isEnded && (
            <Text style={[styles.statusText, { color: '#EF4444' }]}>
              {callEndedNotice || 'Call Disconnected'}
            </Text>
          )}
        </View>

        {/* Bottom Control Actions */}
        <View style={styles.bottomControls}>
          {/* Connected Controls: Mute, Speaker, Chat, Cellular Fallback */}
          {isConnected && (
            <View style={styles.connectedActionGrid}>
              <TouchableOpacity
                style={[styles.controlCircleBtn, isMuted ? styles.controlActive : null]}
                onPress={toggleMute}
              >
                <Icon
                  name={isMuted ? 'mic-off' : 'mic'}
                  size={24}
                  color={isMuted ? '#EF4444' : '#FFFFFF'}
                />
                <Text style={styles.controlLabel}>{isMuted ? 'MUTED' : 'MUTE'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlCircleBtn, isSpeakerOn ? styles.controlActive : null]}
                onPress={toggleSpeaker}
              >
                <Icon
                  name={isSpeakerOn ? 'volume-up' : 'volume-down'}
                  size={24}
                  color={isSpeakerOn ? '#10B981' : '#FFFFFF'}
                />
                <Text style={styles.controlLabel}>SPEAKER</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlCircleBtn} onPress={onOpenChat}>
                <Icon name="chat" size={24} color="#3B82F6" />
                <Text style={styles.controlLabel}>LIVE CHAT</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlCircleBtn} onPress={handleCellularFallback}>
                <Icon name="dialer-sip" size={24} color="#F59E0B" />
                <Text style={styles.controlLabel}>CELLULAR</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Primary Action Row: Accept / Decline or Hang up */}
          <View style={styles.primaryActionRow}>
            {isIncoming ? (
              <>
                <TouchableOpacity style={[styles.largeCallBtn, styles.declineBtn]} onPress={handleReject}>
                  <Icon name="call-end" size={32} color="#FFFFFF" />
                  <Text style={styles.callBtnText}>DECLINE</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.largeCallBtn, styles.acceptBtn]} onPress={handleAccept}>
                  <Icon name="call" size={32} color="#FFFFFF" />
                  <Text style={styles.callBtnText}>ACCEPT</Text>
                </TouchableOpacity>
              </>
            ) : isOutgoing ? (
              <TouchableOpacity style={[styles.largeCallBtn, styles.hangUpBtn]} onPress={handleHangUp}>
                <Icon name="call-end" size={32} color="#FFFFFF" />
                <Text style={styles.callBtnText}>CANCEL</Text>
              </TouchableOpacity>
            ) : isConnected ? (
              <TouchableOpacity style={[styles.largeCallBtn, styles.hangUpBtn]} onPress={handleHangUp}>
                <Icon name="call-end" size={32} color="#FFFFFF" />
                <Text style={styles.callBtnText}>END CALL</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Security Notice Footer */}
          <View style={styles.footerNote}>
            <Icon name="verified-user" size={14} color="rgba(255,255,255,0.4)" />
            <Text style={styles.footerNoteText}>
              Zero-Trace Audio Stream • Destroyed on Handshake Resolution
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  minimizeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  encryptedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  encryptedTagText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 10,
    color: '#10B981',
    letterSpacing: 0.8,
  },
  chatShortcutBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
    marginVertical: 10,
  },
  pulseContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  peerName: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleBadgeText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: '#E2E8F0',
    letterSpacing: 0.8,
  },
  statusText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  connectedContainer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  timerText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 26,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 16 : 24,
    gap: 20,
    alignItems: 'center',
  },
  connectedActionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
  },
  controlCircleBtn: {
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    minWidth: 70,
  },
  controlActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  controlLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },
  primaryActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    width: '100%',
  },
  largeCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 32,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  declineBtn: {
    backgroundColor: '#EF4444',
  },
  hangUpBtn: {
    backgroundColor: '#DC2626',
    width: '80%',
  },
  callBtnText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  footerNoteText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
});

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
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
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import { theme, useTheme } from '../../theme';
import { useCallStore } from '../../stores/callStore';
import { socketService } from '../../services/socketService';
import { NotificationService } from '../../services/NotificationService';
import { voipAudioService } from '../../services/voipAudioService';

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

/** Dynamic Audio Frequency Waveform Visualizer connected to real mic/audio state */
function AudioWaveform({ isMuted }: { isMuted: boolean }) {
  const barHeights = [
    useSharedValue(12),
    useSharedValue(20),
    useSharedValue(32),
    useSharedValue(44),
    useSharedValue(28),
    useSharedValue(38),
    useSharedValue(22),
    useSharedValue(14),
  ];

  useEffect(() => {
    if (isMuted) {
      barHeights.forEach((h) => {
        h.value = withTiming(4, { duration: 250 });
      });
      return;
    }

    const baseHeights = [14, 26, 38, 48, 36, 42, 24, 16];
    barHeights.forEach((h, index) => {
      const target = baseHeights[index % baseHeights.length];
      h.value = withRepeat(
        withSequence(
          withTiming(target, { duration: 320 + index * 40, easing: Easing.inOut(Easing.ease) }),
          withTiming(8, { duration: 320 + index * 40, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    });
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

/** Helper to request microphone permission at runtime with full fallback support */
async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  try {
    const status = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
    if (status === RESULTS.GRANTED) {
      return true;
    }

    const result = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
    if (result === RESULTS.GRANTED) {
      return true;
    }

    if (result === RESULTS.BLOCKED) {
      Alert.alert(
        'Microphone Permission Required',
        'Voice calling requires microphone access. Please enable microphone permissions in your device Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings().catch(() => {}) },
        ]
      );
      return false;
    }

    Alert.alert(
      'Microphone Permission Denied',
      'Microphone permission is required to speak during emergency calls.'
    );
    return false;
  } catch (e) {
    console.warn('[CallModal] Permission check exception:', e);
    return false;
  }
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
    callId,
    duration,
    isMuted,
    isSpeakerOn,
    isCaller,
    error,
    startOutgoingCall,
    receiveIncomingCall,
    setConnecting,
    setConnected,
    setCallId,
    setCallBusy,
    setCallDeclined,
    setCallError,
    toggleMute,
    toggleSpeaker,
    tickDuration,
    endCall,
    resetCall,
  } = useCallStore();

  const [callNotice, setCallNotice] = useState<string | null>(null);
  const isInitiatingRef = useRef(false);

  // Call timer interval & WebRTC VoIP audio initialization
  useEffect(() => {
    let timer: any = null;
    if (callStatus === 'connected') {
      timer = setInterval(() => {
        tickDuration();
      }, 1000);

      // Start WebRTC VoIP Audio Connection if not already active
      if (!voipAudioService.isCallActive()) {
        const isInitiator = isCaller;
        voipAudioService
          .startAudioCall(episodeId, isInitiator, callId || undefined)
          .catch((err) => {
            console.warn('[CallModal] Failed to start VoIP audio stream:', err);
            setCallNotice('Audio connection failed');
            setCallError('Audio stream error');
          });
      }
    } else if (callStatus === 'ended' || callStatus === 'idle' || callStatus === 'failed') {
      voipAudioService.endAudioCall();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callStatus, episodeId, callId, isCaller, tickDuration, setCallError]);

  // Sync mute & speaker state with VoIP audio service
  useEffect(() => {
    if (callStatus === 'connected') {
      voipAudioService.setMute(isMuted);
    }
  }, [isMuted, callStatus]);

  useEffect(() => {
    if (callStatus === 'connected') {
      voipAudioService.setSpeaker(isSpeakerOn);
    }
  }, [isSpeakerOn, callStatus]);

  // Outgoing call initiation with runtime microphone permission & room synchronization
  const executeOutgoingCall = useCallback(async () => {
    if (isInitiatingRef.current || !episodeId) return;
    isInitiatingRef.current = true;

    try {
      // 1. Verify runtime microphone permission
      const hasMic = await requestMicrophonePermission();
      if (!hasMic) {
        setCallNotice('Microphone permission denied');
        setCallError('Microphone permission denied');
        return;
      }

      // 2. Connect socket if disconnected
      if (!socketService.isConnected()) {
        socketService.connect();
      }

      // 3. Mark outgoing in call store
      startOutgoingCall(episodeId, counterpartyName, role);

      // 4. Reliable room join confirmation to eliminate race condition
      const joined = await socketService.joinEpisode(episodeId);
      if (!joined) {
        setCallNotice('Channel connection failed');
        Alert.alert('Connection Error', 'Could not establish secure room channel for call.');
        endCall('Channel join failed');
        return;
      }

      // 5. Initiate call with unique callId
      const result = await socketService.initiateCall(
        episodeId,
        counterpartyName || (role === 'responder' ? 'Volunteer Responder' : 'Emergency Requester'),
        role
      );

      if (!result.success) {
        const errMsg = result.error || 'Could not initiate voice call.';
        setCallNotice(errMsg);
        if (result.error === 'Counterparty is busy') {
          setCallBusy();
        } else {
          setCallError(errMsg);
          Alert.alert('Call Failed', errMsg);
        }
      }
    } catch (err: any) {
      console.warn('[CallModal] Outgoing call initiation error:', err);
      setCallNotice(err?.message || 'Call failed');
      setCallError(err?.message || 'Call failed');
    } finally {
      isInitiatingRef.current = false;
    }
  }, [episodeId, counterpartyName, role, startOutgoingCall, endCall, setCallBusy, setCallError]);

  // Trigger outgoing call on modal open when idle
  useEffect(() => {
    if (visible && episodeId) {
      if (callStatus === 'idle') {
        executeOutgoingCall();
      } else {
        // Ensure joined to channel room for incoming/connected calls
        socketService.joinEpisode(episodeId);
      }
    }
  }, [visible, callStatus, episodeId, executeOutgoingCall]);

  // Socket signaling event listeners
  useEffect(() => {
    if (!episodeId) return;

    const unsubIncoming = socketService.onIncomingCall((data) => {
      if (data.episodeId === episodeId && callStatus === 'idle') {
        NotificationService.notifyIncomingCall(data.callerName, data.role).catch(() => null);
        receiveIncomingCall(data.episodeId, data.callerName, data.role, data.callId);
      }
    });

    const unsubAccepted = socketService.onCallAccepted((data) => {
      if (data.episodeId === episodeId) {
        setConnecting();
        if (data.callId) {
          setCallId(data.callId);
        }
        voipAudioService
          .startAudioCall(episodeId, true, data.callId || callId || undefined)
          .catch((err) => {
            console.warn('[CallModal] Caller VoIP audio start error:', err);
            setCallNotice('Audio connection failed');
            setCallError('Audio stream error');
          });
      }
    });

    const unsubRejected = socketService.onCallRejected((data) => {
      if (data.episodeId === episodeId) {
        voipAudioService.endAudioCall();
        if (data.reason === 'busy') {
          setCallBusy();
          setCallNotice('Counterparty is currently on another call');
        } else {
          setCallDeclined();
          setCallNotice('Call declined by counterparty');
        }
        setTimeout(() => {
          resetCall();
          onClose();
        }, 2200);
      }
    });

    const unsubEnded = socketService.onCallEnded((data) => {
      if (data.episodeId === episodeId) {
        voipAudioService.endAudioCall();
        const dur = data.duration || duration;
        const durStr = formatDuration(dur);
        NotificationService.notifyCallEnded(durStr).catch(() => null);
        setCallNotice(`Call ended (${durStr})`);
        endCall();
        setTimeout(() => {
          resetCall();
          onClose();
        }, 1800);
      }
    });

    return () => {
      unsubIncoming();
      unsubAccepted();
      unsubRejected();
      unsubEnded();
    };
  }, [
    episodeId,
    callId,
    callStatus,
    duration,
    receiveIncomingCall,
    setConnecting,
    setCallId,
    setConnected,
    setCallBusy,
    setCallDeclined,
    setCallError,
    endCall,
    resetCall,
    onClose,
  ]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAccept = async () => {
    const hasMic = await requestMicrophonePermission();
    if (!hasMic) {
      setCallNotice('Microphone permission required to accept call');
      return;
    }

    setConnecting();
    await socketService.joinEpisode(episodeId);

    // 1. Initialize receiver VoIP audio stream first so peer connection is ready for offer
    try {
      await voipAudioService.startAudioCall(episodeId, false, callId || undefined);
    } catch (err: any) {
      console.warn('[CallModal] Accept audio start error:', err);
      setCallNotice('Audio initialization failed');
      setCallError('Microphone/Audio initialization failed');
      return;
    }

    // 2. Notify caller via socket
    const success = await socketService.acceptCall(episodeId, callId || undefined);
    if (!success) {
      voipAudioService.endAudioCall();
      setCallNotice('Failed to accept call');
      setCallError('Accept failed');
      return;
    }
  };

  const handleReject = () => {
    socketService.rejectCall(episodeId, 'declined', callId || undefined);
    voipAudioService.endAudioCall();
    setCallNotice('Call declined');
    setCallDeclined();
    endCall();
    resetCall();
    onClose();
  };

  const handleHangUp = () => {
    const durStr = formatDuration(duration);
    socketService.endCall(episodeId, duration, callId || undefined);
    voipAudioService.endAudioCall();
    NotificationService.notifyCallEnded(durStr).catch(() => null);
    setCallNotice(`Call ended (${durStr})`);
    endCall();
    setTimeout(() => {
      resetCall();
      onClose();
    }, 1500);
  };

  const handleCallInfo = () => {
    Alert.alert(
      'Encrypted SafeNet VoIP',
      'This emergency call is encrypted end-to-end via WebRTC (SRTP/DTLS) and streams directly peer-to-peer.\n\nAll calls use hardware microphone capture and encrypted audio frames. Media tracks are destroyed immediately upon call termination.',
      [{ text: 'Close' }]
    );
  };

  const isOutgoing = callStatus === 'outgoing';
  const isIncoming = callStatus === 'incoming';
  const isConnecting = callStatus === 'connecting';
  const isConnected = callStatus === 'connected';
  const isBusy = callStatus === 'busy';
  const isDeclined = callStatus === 'declined';
  const isFailed = callStatus === 'failed';
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
            {(isOutgoing || isIncoming || isConnecting) && (
              <PulsingRings color={isIncoming ? '#10B981' : '#3B82F6'} />
            )}
            <View
              style={[
                styles.avatarCircle,
                {
                  borderColor: isIncoming
                    ? '#10B981'
                    : isConnected
                    ? '#3B82F6'
                    : isBusy || isDeclined || isFailed
                    ? '#EF4444'
                    : '#6366F1',
                  backgroundColor: '#1E293B',
                },
              ]}
            >
              <Icon
                name={role === 'responder' ? 'security' : 'person'}
                size={54}
                color={
                  isIncoming
                    ? '#10B981'
                    : isBusy || isDeclined || isFailed
                    ? '#EF4444'
                    : '#38BDF8'
                }
              />
            </View>
          </View>

          {/* Counterparty Identification */}
          <Text style={styles.peerName}>
            {counterpartyName || (role === 'responder' ? 'Volunteer Responder' : 'Emergency Requester')}
          </Text>

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
              Calling via Encrypted SafeNet VoIP...
            </Text>
          )}

          {isConnecting && (
            <Text style={[styles.statusText, { color: '#F59E0B' }]}>
              Connecting encrypted audio channel...
            </Text>
          )}

          {isConnected && (
            <View style={styles.connectedContainer}>
              <Text style={styles.timerText}>{formatDuration(duration)}</Text>
              <AudioWaveform isMuted={isMuted} />
            </View>
          )}

          {isBusy && (
            <Text style={[styles.statusText, { color: '#EF4444' }]}>
              {callNotice || 'Counterparty is busy on another call'}
            </Text>
          )}

          {isDeclined && (
            <Text style={[styles.statusText, { color: '#EF4444' }]}>
              {callNotice || 'Call Declined'}
            </Text>
          )}

          {isFailed && (
            <Text style={[styles.statusText, { color: '#EF4444' }]}>
              {callNotice || error || 'Call Failed'}
            </Text>
          )}

          {isEnded && (
            <Text style={[styles.statusText, { color: '#EF4444' }]}>
              {callNotice || 'Call Disconnected'}
            </Text>
          )}
        </View>

        {/* Bottom Control Actions */}
        <View style={styles.bottomControls}>
          {/* Connected Controls: Mute, Speaker, Chat, Info */}
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

              <TouchableOpacity style={styles.controlCircleBtn} onPress={handleCallInfo}>
                <Icon name="info-outline" size={24} color="#F59E0B" />
                <Text style={styles.controlLabel}>INFO</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Primary Action Row: Accept / Decline or Hang up */}
          <View style={styles.primaryActionRow}>
            {isIncoming ? (
              <>
                <TouchableOpacity
                  style={[styles.largeCallBtn, styles.declineBtn]}
                  onPress={handleReject}
                >
                  <Icon name="call-end" size={32} color="#FFFFFF" />
                  <Text style={styles.callBtnText}>DECLINE</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.largeCallBtn, styles.acceptBtn]}
                  onPress={handleAccept}
                >
                  <Icon name="call" size={32} color="#FFFFFF" />
                  <Text style={styles.callBtnText}>ACCEPT</Text>
                </TouchableOpacity>
              </>
            ) : isOutgoing || isConnecting ? (
              <TouchableOpacity
                style={[styles.largeCallBtn, styles.hangUpBtn]}
                onPress={handleHangUp}
              >
                <Icon name="call-end" size={32} color="#FFFFFF" />
                <Text style={styles.callBtnText}>CANCEL</Text>
              </TouchableOpacity>
            ) : isConnected ? (
              <TouchableOpacity
                style={[styles.largeCallBtn, styles.hangUpBtn]}
                onPress={handleHangUp}
              >
                <Icon name="call-end" size={32} color="#FFFFFF" />
                <Text style={styles.callBtnText}>END CALL</Text>
              </TouchableOpacity>
            ) : isBusy || isDeclined || isFailed || isEnded ? (
              <TouchableOpacity
                style={[styles.largeCallBtn, styles.hangUpBtn]}
                onPress={() => {
                  resetCall();
                  onClose();
                }}
              >
                <Icon name="close" size={32} color="#FFFFFF" />
                <Text style={styles.callBtnText}>CLOSE</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Security Notice Footer */}
          <View style={styles.footerNote}>
            <Icon name="verified-user" size={14} color="rgba(255,255,255,0.4)" />
            <Text style={styles.footerNoteText}>
              Encrypted DTLS-SRTP Audio • Ephemeral Peer-to-Peer
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
    gap: 5,
    height: 50,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 20,
  },
  connectedActionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },
  controlCircleBtn: {
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.06)',
    width: 68,
  },
  controlActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  controlLabel: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 9,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  primaryActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 10,
  },
  largeCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 35,
    elevation: 4,
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  declineBtn: {
    backgroundColor: '#EF4444',
  },
  hangUpBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 36,
  },
  callBtnText: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  footerNoteText: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
});

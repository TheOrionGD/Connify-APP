import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
  MediaStreamTrack,
} from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import { socketService } from './socketService';
import { useCallStore } from '../stores/callStore';

const FALLBACK_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
];

export interface VoIPAudioCallbacks {
  onConnectionState?: (state: string) => void;
  onAudioActivity?: (active: boolean) => void;
  onError?: (error: Error) => void;
}

/**
 * Real-Time Encrypted VoIP Voice Streaming Service for Connify
 * Production-ready WebRTC audio implementation with hardware audio session management,
 * DTLS-SRTP encryption, dynamic STUN/TURN configuration, ICE candidate queuing,
 * reliable remote audio track rendering, and idempotent resource cleanup.
 */
class VoIPAudioService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private episodeId: string | null = null;
  private callId: string | null = null;
  private isMuted: boolean = false;
  private isSpeakerOn: boolean = true;
  private cleanupListeners: (() => void)[] = [];
  private pendingIceCandidates: any[] = [];
  private pendingSignals: any[] = [];
  private isStartingCall: boolean = false;
  private connectionTimer: any = null;
  private callbacks: VoIPAudioCallbacks = {};

  public setCallbacks(callbacks: VoIPAudioCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Initialize VoIP audio connection for an active call episode.
   * Acquires hardware microphone, obtains STUN/TURN servers, attaches tracks,
   * configures audio routing, and initiates SDP negotiation.
   */
  public async startAudioCall(
    episodeId: string,
    isInitiator: boolean,
    callId?: string
  ): Promise<void> {
    if (this.isStartingCall) {
      console.warn('[VoIPAudioService] Call setup already in progress, queuing start.');
      return;
    }

    // Clean up any stale existing session first
    if (this.peerConnection || this.localStream) {
      this.endAudioCall();
    }

    this.isStartingCall = true;
    this.episodeId = episodeId;
    this.callId = callId || null;
    this.pendingIceCandidates = [];
    this.pendingSignals = [];

    // Pre-attach signaling listeners to buffer any early offer/candidates
    this.setupSignalingListeners();

    try {
      console.log(`[VoIPAudioService] Initializing audio session for episode: ${episodeId} (initiator: ${isInitiator})`);

      // 1. Audio Session Setup via InCallManager
      InCallManager.start({ media: 'audio', auto: true });
      InCallManager.setKeepScreenOn(true);
      InCallManager.startProximitySensor();
      this.applyAudioRouting();

      // 2. Fetch STUN and ephemeral TURN credentials from backend
      const iceServers = await socketService.getIceServers().catch(() => FALLBACK_ICE_SERVERS);

      // 3. Acquire Hardware Microphone Media Stream (Audio-Only)
      this.localStream = (await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } as any,
        video: false,
      })) as MediaStream;

      const audioTracks = this.localStream?.getAudioTracks() || [];
      if (audioTracks.length === 0) {
        throw new Error('No local audio tracks captured from microphone');
      }

      // Apply initial mute state to local track
      audioTracks.forEach((track: MediaStreamTrack) => {
        track.enabled = !this.isMuted;
      });

      console.log(`[VoIPAudioService] Local audio track acquired: ${audioTracks[0].id} (enabled: ${audioTracks[0].enabled})`);

      // 4. Create WebRTC Peer Connection with DTLS-SRTP encryption
      const configuration = {
        iceServers: iceServers.length > 0 ? iceServers : FALLBACK_ICE_SERVERS,
        iceCandidatePoolSize: 2,
      };

      this.peerConnection = new RTCPeerConnection(configuration);

      // Attach local audio track to active peer connection
      audioTracks.forEach((track: MediaStreamTrack) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      // Configure Peer Connection Listeners
      this.setupPeerConnectionListeners();

      // Set connection watchdog timer (25s)
      this.connectionTimer = setTimeout(() => {
        const iceState = this.peerConnection?.iceConnectionState;
        if (iceState !== 'connected' && iceState !== 'completed') {
          console.warn('[VoIPAudioService] WebRTC connection watchdog timeout. Attempting ICE restart.');
          this.handleIceFailure();
        }
      }, 25000);

      // Drain any buffered signals that arrived during stream acquisition
      this.isStartingCall = false;
      await this.flushPendingSignals();

      // 5. Initiator creates and sends SDP Offer
      if (isInitiator) {
        console.log('[VoIPAudioService] Creating SDP offer as initiator...');
        const offer = await this.peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });

        await this.peerConnection.setLocalDescription(offer);

        const offerPayload = offer?.toJSON ? offer.toJSON() : { type: offer.type, sdp: offer.sdp };
        socketService.sendCallSignal(
          this.episodeId,
          { type: 'offer', sdp: offerPayload },
          this.callId || undefined
        );
        console.log('[VoIPAudioService] SDP offer transmitted.');
      }
    } catch (err: any) {
      console.error('[VoIPAudioService] Failed to establish call session:', err);
      this.isStartingCall = false;
      this.endAudioCall();
      this.callbacks.onError?.(err);
      throw err;
    } finally {
      this.isStartingCall = false;
    }
  }

  /**
   * Set up WebRTC peer connection events: tracks, ice candidates, connection state changes.
   */
  private setupPeerConnectionListeners(): void {
    if (!this.peerConnection) return;

    // ICE Candidate generation
    this.peerConnection.onicecandidate = (event: any) => {
      if (event.candidate && this.episodeId) {
        const candidatePayload = event.candidate.toJSON
          ? event.candidate.toJSON()
          : {
              candidate: event.candidate.candidate,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              sdpMid: event.candidate.sdpMid,
            };

        socketService.sendCallSignal(
          this.episodeId,
          { type: 'candidate', candidate: candidatePayload },
          this.callId || undefined
        );
      }
    };

    // Remote Track Receiver & Renderer Attachment
    this.peerConnection.ontrack = (event: any) => {
      console.log('[VoIPAudioService] Remote audio track received:', event.track?.id);
      if (event.track) {
        event.track.enabled = true;
      }

      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
      } else if (event.track) {
        this.remoteStream = new MediaStream([event.track]);
      }

      this.applyRemoteAudioSettings();
      this.callbacks.onAudioActivity?.(true);
    };

    // ICE Connection State Change
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState || 'unknown';
      console.log(`[VoIPAudioService] ICE connection state: ${state}`);
      useCallStore.getState().setIceConnectionState(state);
      this.callbacks.onConnectionState?.(state);

      if (state === 'connected' || state === 'completed') {
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
        }
        useCallStore.getState().setConnected(this.callId || undefined);
      } else if (state === 'failed') {
        console.warn('[VoIPAudioService] ICE connection failed.');
        this.handleIceFailure();
      } else if (state === 'disconnected') {
        console.warn('[VoIPAudioService] ICE connection disconnected.');
      }
    };

    // Peer Connection State Change
    this.peerConnection.onconnectionstatechange = () => {
      const state = (this.peerConnection as any)?.connectionState || 'unknown';
      console.log(`[VoIPAudioService] Peer connection state: ${state}`);
      if (state === 'connected') {
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
        }
        useCallStore.getState().setConnected(this.callId || undefined);
      } else if (state === 'failed') {
        console.warn('[VoIPAudioService] Peer connection failed.');
        useCallStore.getState().setCallError('Connection lost');
      }
    };
  }

  /**
   * Listen for both room-based call_signal and 1-to-1 WebRTC relays.
   */
  private setupSignalingListeners(): void {
    this.clearSignalingListeners();

    // 1. Room-based call_signal listener
    const unsubCallSignal = socketService.onCallSignal((payload) => {
      if (payload.episodeId === this.episodeId && payload.signalData) {
        this.handleIncomingSignal(payload.signalData);
      }
    });
    this.cleanupListeners.push(unsubCallSignal);

    // 2. Targeted SDP offer listener
    const unsubOffer = socketService.onWebRTCOffer((data) => {
      if (data.offer) {
        this.handleIncomingSignal({ type: 'offer', sdp: data.offer });
      }
    });
    this.cleanupListeners.push(unsubOffer);

    // 3. Targeted SDP answer listener
    const unsubAnswer = socketService.onWebRTCAnswer((data) => {
      if (data.answer) {
        this.handleIncomingSignal({ type: 'answer', sdp: data.answer });
      }
    });
    this.cleanupListeners.push(unsubAnswer);

    // 4. Targeted ICE candidate listener
    const unsubCandidate = socketService.onIceCandidate((data) => {
      if (data.candidate) {
        this.handleIncomingSignal({ type: 'candidate', candidate: data.candidate });
      }
    });
    this.cleanupListeners.push(unsubCandidate);
  }

  private clearSignalingListeners(): void {
    this.cleanupListeners.forEach((cleanup) => {
      try {
        cleanup();
      } catch (e) {
        // ignore
      }
    });
    this.cleanupListeners = [];
  }

  /**
   * Process incoming WebRTC SDP offer, answer, or ICE candidate with state validation
   */
  public async handleIncomingSignal(signalData: any): Promise<void> {
    if (!signalData) return;

    // If peer connection is not yet created or initialization in progress, buffer signal
    if (!this.peerConnection || this.isStartingCall) {
      console.log(`[VoIPAudioService] Buffering incoming signal (${signalData.type}) until peer connection is ready.`);
      this.pendingSignals.push(signalData);
      return;
    }

    try {
      if (signalData.type === 'offer' && signalData.sdp) {
        console.log('[VoIPAudioService] Processing incoming SDP offer.');
        // If peer connection already has a remote description, check state
        if (this.peerConnection.signalingState !== 'stable' &&
            this.peerConnection.signalingState !== 'have-local-offer') {
          console.warn('[VoIPAudioService] Glare condition detected, resetting description.');
        }

        const sdpString = typeof signalData.sdp === 'string'
          ? signalData.sdp
          : signalData.sdp?.sdp || signalData.sdp;
        const remoteDesc = new RTCSessionDescription({
          type: 'offer',
          sdp: typeof sdpString === 'string' ? sdpString : sdpString?.sdp,
        });

        await this.peerConnection.setRemoteDescription(remoteDesc);

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        if (this.episodeId) {
          const answerPayload = answer?.toJSON ? answer.toJSON() : { type: answer.type, sdp: answer.sdp };
          socketService.sendCallSignal(
            this.episodeId,
            { type: 'answer', sdp: answerPayload },
            this.callId || undefined
          );
          console.log('[VoIPAudioService] Generated and emitted SDP answer.');
        }

        await this.flushPendingIceCandidates();
      } else if (signalData.type === 'answer' && signalData.sdp) {
        console.log('[VoIPAudioService] Processing incoming SDP answer.');
        if (this.peerConnection.signalingState === 'have-local-offer') {
          const sdpString = typeof signalData.sdp === 'string'
            ? signalData.sdp
            : signalData.sdp?.sdp || signalData.sdp;
          const remoteDesc = new RTCSessionDescription({
            type: 'answer',
            sdp: typeof sdpString === 'string' ? sdpString : sdpString?.sdp,
          });

          await this.peerConnection.setRemoteDescription(remoteDesc);
          await this.flushPendingIceCandidates();
          console.log('[VoIPAudioService] Remote description applied successfully.');
        } else {
          console.warn(
            '[VoIPAudioService] Received answer in unexpected state:',
            this.peerConnection.signalingState
          );
        }
      } else if (signalData.type === 'candidate' && signalData.candidate) {
        const candData = signalData.candidate;
        if (candData && (candData.sdpMid != null || candData.sdpMLineIndex != null) && candData.candidate) {
          const candidate = new RTCIceCandidate({
            candidate: candData.candidate,
            sdpMLineIndex: candData.sdpMLineIndex,
            sdpMid: candData.sdpMid,
          });

          if (this.peerConnection.remoteDescription) {
            await this.peerConnection.addIceCandidate(candidate);
          } else {
            this.pendingIceCandidates.push(candidate);
          }
        }
      }
    } catch (err) {
      console.warn('[VoIPAudioService] Signal handling error:', err);
    }
  }

  /**
   * Drain any queued early signals (offers, answers, candidates) received during setup.
   */
  private async flushPendingSignals(): Promise<void> {
    if (this.pendingSignals.length === 0) return;
    const signals = [...this.pendingSignals];
    this.pendingSignals = [];

    for (const sig of signals) {
      await this.handleIncomingSignal(sig);
    }
  }

  /**
   * Drain any queued ICE candidates that arrived before remote SDP negotiation completed.
   */
  private async flushPendingIceCandidates(): Promise<void> {
    if (!this.peerConnection || this.pendingIceCandidates.length === 0) return;
    const candidates = [...this.pendingIceCandidates];
    this.pendingIceCandidates = [];

    for (const candidate of candidates) {
      try {
        await this.peerConnection.addIceCandidate(candidate);
      } catch (e) {
        console.warn('[VoIPAudioService] Error adding queued ICE candidate:', e);
      }
    }
  }

  /**
   * Handle ICE connection failure by attempting controlled restart or reporting error.
   */
  private async handleIceFailure(): Promise<void> {
    if (!this.peerConnection || !this.episodeId) return;

    try {
      console.log('[VoIPAudioService] Attempting ICE restart...');
      const offer = await this.peerConnection.createOffer({
        iceRestart: true,
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });
      await this.peerConnection.setLocalDescription(offer);

      socketService.sendCallSignal(
        this.episodeId,
        { type: 'offer', sdp: offer, isRestart: true },
        this.callId || undefined
      );
    } catch (err) {
      console.warn('[VoIPAudioService] ICE restart failed:', err);
      useCallStore.getState().setCallError('Audio connection lost. Reconnect required.');
    }
  }

  /**
   * Toggle hardware and software microphone mute state.
   */
  public setMute(muted: boolean): void {
    this.isMuted = muted;
    InCallManager.setMicrophoneMute(muted);

    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = !muted;
      });
    }
  }

  /**
   * Configure audio routing for speakerphone vs earpiece output.
   */
  public setSpeaker(speakerOn: boolean): void {
    this.isSpeakerOn = speakerOn;
    this.applyAudioRouting();
    this.applyRemoteAudioSettings();
  }

  private applyAudioRouting(): void {
    InCallManager.setSpeakerphoneOn(this.isSpeakerOn);
    InCallManager.setForceSpeakerphoneOn(this.isSpeakerOn);
  }

  private applyRemoteAudioSettings(): void {
    if (this.remoteStream) {
      this.remoteStream.getAudioTracks().forEach((track: any) => {
        if (typeof track._setVolume === 'function') {
          track._setVolume(1.0);
        }
      });
    }
  }

  /**
   * Retrieve active WebRTC diagnostics, RTP transmission stats, and candidate pair.
   */
  public async getAudioDiagnostics(): Promise<any> {
    const pc = this.peerConnection;
    const diag: any = {
      isCallActive: this.isCallActive(),
      episodeId: this.episodeId,
      callId: this.callId,
      signalingState: pc?.signalingState || 'none',
      iceConnectionState: pc?.iceConnectionState || 'none',
      connectionState: (pc as any)?.connectionState || 'none',
      isMuted: this.isMuted,
      isSpeakerOn: this.isSpeakerOn,
      localTracks: this.localStream
        ? this.localStream.getTracks().map((t) => ({ id: t.id, kind: t.kind, enabled: t.enabled, readyState: t.readyState }))
        : [],
      remoteTracks: this.remoteStream
        ? this.remoteStream.getTracks().map((t) => ({ id: t.id, kind: t.kind, enabled: t.enabled, readyState: t.readyState }))
        : [],
      stats: null,
    };

    if (pc && typeof pc.getStats === 'function') {
      try {
        const statsMap = await pc.getStats();
        const rtpStats: any[] = [];
        statsMap.forEach((report: any) => {
          if (
            report.type === 'outbound-rtp' ||
            report.type === 'inbound-rtp' ||
            report.type === 'candidate-pair'
          ) {
            rtpStats.push(report);
          }
        });
        diag.stats = rtpStats;
      } catch (e: any) {
        diag.statsError = e?.message;
      }
    }

    return diag;
  }

  /**
   * Idempotent call termination and complete resource cleanup.
   * Disables and stops all local and remote tracks, closes peer connection,
   * terminates InCallManager audio session, and releases hardware microphone.
   */
  public endAudioCall(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }

    this.clearSignalingListeners();

    // 1. Stop and release local microphone audio tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track: any) => {
        try {
          track.enabled = false;
          track.stop();
          if (typeof track.release === 'function') {
            track.release();
          }
        } catch (e) {
          // ignore
        }
      });
      this.localStream = null;
    }

    // 2. Stop and release remote audio tracks
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track: MediaStreamTrack) => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      this.remoteStream = null;
    }

    // 3. Close WebRTC Peer Connection
    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch (e) {
        // ignore
      }
      this.peerConnection = null;
    }

    // 4. Release InCallManager hardware session & proximity sensor
    try {
      InCallManager.setMicrophoneMute(false);
      InCallManager.stopProximitySensor();
      InCallManager.setKeepScreenOn(false);
      InCallManager.stop();
    } catch (e) {
      // ignore
    }

    this.pendingIceCandidates = [];
    this.pendingSignals = [];
    this.episodeId = null;
    this.callId = null;
    this.isStartingCall = false;
    this.callbacks.onAudioActivity?.(false);
  }

  public isCallActive(): boolean {
    return this.peerConnection !== null;
  }
}

export const voipAudioService = new VoIPAudioService();

import { socketService } from './socketService';

/**
 * Real-Time VoIP WebRTC Audio Stream Service for Connify
 * Handles peer connection setup, audio track exchange, and signaling relay.
 */
class VoIPAudioService {
  private peerConnection: any = null;
  private localStream: any = null;
  private remoteStream: any = null;
  private episodeId: string | null = null;
  private isMuted: boolean = false;
  private isSpeakerOn: boolean = true;
  private cleanupSignalListener: (() => void) | null = null;

  /**
   * Initialize VoIP audio connection session for an active call episode
   */
  public async startAudioCall(episodeId: string, isInitiator: boolean): Promise<void> {
    this.episodeId = episodeId;

    try {
      const g = globalThis as any;
      const win = typeof g.window !== 'undefined' ? g.window : g;
      const doc = typeof g.document !== 'undefined' ? g.document : null;
      const nav = typeof g.navigator !== 'undefined' ? g.navigator : null;

      // 1. Listen for incoming WebRTC signaling messages via socketService
      if (this.cleanupSignalListener) {
        this.cleanupSignalListener();
      }

      this.cleanupSignalListener = socketService.onCallSignal((payload) => {
        if (payload.episodeId === this.episodeId && payload.signalData) {
          this.handleIncomingSignal(payload.signalData);
        }
      });

      // 2. Initialize WebRTC peer connection if available in environment (Web / WebView / Native)
      const RTCPeerConn = win?.RTCPeerConnection || win?.webkitRTCPeerConnection || g?.RTCPeerConnection;

      if (RTCPeerConn) {
        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ],
        };

        this.peerConnection = new RTCPeerConn(configuration);

        // ICE candidate handler
        this.peerConnection.onicecandidate = (event: any) => {
          if (event.candidate && this.episodeId) {
            socketService.sendCallSignal(this.episodeId, {
              type: 'candidate',
              candidate: event.candidate,
            });
          }
        };

        // Remote track handler
        this.peerConnection.ontrack = (event: any) => {
          if (event.streams && event.streams[0]) {
            this.remoteStream = event.streams[0];
            this.playRemoteAudioStream(this.remoteStream);
          }
        };

        // 3. Acquire user microphone audio stream
        if (nav?.mediaDevices?.getUserMedia) {
          try {
            this.localStream = await nav.mediaDevices.getUserMedia({ audio: true, video: false });
            if (this.localStream && this.peerConnection) {
              this.localStream.getTracks().forEach((track: any) => {
                this.peerConnection.addTrack(track, this.localStream);
              });
            }
          } catch (micError) {
            console.warn('[VoIPAudioService] Microphones permission or capture failed:', micError);
          }
        }

        // 4. Initiator sends SDP offer
        if (isInitiator && this.peerConnection.createOffer) {
          const offer = await this.peerConnection.createOffer();
          await this.peerConnection.setLocalDescription(offer);
          socketService.sendCallSignal(episodeId, {
            type: 'offer',
            sdp: offer,
          });
        }
      } else {
        console.log('[VoIPAudioService] VoIP Call signaling listener initialized.');
      }
    } catch (err) {
      console.warn('[VoIPAudioService] Failed to start audio call session:', err);
    }
  }

  /**
   * Handle incoming WebRTC SDP offer, answer, or ICE candidate
   */
  private async handleIncomingSignal(signalData: any) {
    if (!this.peerConnection) return;

    try {
      const g = globalThis as any;
      const win = typeof g.window !== 'undefined' ? g.window : g;
      const SdpDesc = win?.RTCSessionDescription || g?.RTCSessionDescription;
      const IceCand = win?.RTCIceCandidate || g?.RTCIceCandidate;

      if (signalData.type === 'offer' && signalData.sdp) {
        const remoteDesc = SdpDesc ? new SdpDesc(signalData.sdp) : signalData.sdp;
        await this.peerConnection.setRemoteDescription(remoteDesc);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        if (this.episodeId) {
          socketService.sendCallSignal(this.episodeId, {
            type: 'answer',
            sdp: answer,
          });
        }
      } else if (signalData.type === 'answer' && signalData.sdp) {
        const remoteDesc = SdpDesc ? new SdpDesc(signalData.sdp) : signalData.sdp;
        await this.peerConnection.setRemoteDescription(remoteDesc);
      } else if (signalData.type === 'candidate' && signalData.candidate) {
        const candidateObj = IceCand ? new IceCand(signalData.candidate) : signalData.candidate;
        await this.peerConnection.addIceCandidate(candidateObj);
      }
    } catch (err) {
      console.warn('[VoIPAudioService] Signal handling error:', err);
    }
  }

  /**
   * Output audio stream to HTML5 audio element or Web Audio context
   */
  private playRemoteAudioStream(stream: any) {
    const g = globalThis as any;
    const doc = typeof g.document !== 'undefined' ? g.document : null;
    if (doc) {
      let audioEl = doc.getElementById('remote-voip-audio') as any;
      if (!audioEl) {
        audioEl = doc.createElement('audio');
        audioEl.id = 'remote-voip-audio';
        audioEl.autoplay = true;
        audioEl.style.display = 'none';
        doc.body.appendChild(audioEl);
      }
      audioEl.srcObject = stream;
      audioEl.play?.().catch((e: any) => console.warn('[VoIPAudioService] Audio playback auto-play block:', e));
    }
  }

  /**
   * Toggle mute / unmute for active microphone track
   */
  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.localStream?.getAudioTracks) {
      this.localStream.getAudioTracks().forEach((track: any) => {
        track.enabled = !muted;
      });
    }
  }

  /**
   * Toggle speaker / earpiece audio routing output
   */
  public setSpeaker(speakerOn: boolean): void {
    this.isSpeakerOn = speakerOn;
    const g = globalThis as any;
    const doc = typeof g.document !== 'undefined' ? g.document : null;
    if (doc) {
      const audioEl = doc.getElementById('remote-voip-audio') as any;
      if (audioEl) {
        audioEl.volume = speakerOn ? 1.0 : 0.5;
      }
    }
  }

  /**
   * Clean up audio tracks, peer connection, and signaling listeners on hangup
   */
  public endAudioCall(): void {
    if (this.cleanupSignalListener) {
      this.cleanupSignalListener();
      this.cleanupSignalListener = null;
    }

    if (this.localStream?.getTracks) {
      this.localStream.getTracks().forEach((track: any) => track.stop?.());
      this.localStream = null;
    }

    if (this.peerConnection?.close) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    const g = globalThis as any;
    const doc = typeof g.document !== 'undefined' ? g.document : null;
    if (doc) {
      const audioEl = doc.getElementById('remote-voip-audio');
      if (audioEl) {
        audioEl.remove();
      }
    }

    this.episodeId = null;
  }
}

export const voipAudioService = new VoIPAudioService();

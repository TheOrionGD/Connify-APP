import * as Keychain from 'react-native-keychain';
import nacl from 'tweetnacl';
import { deviceApi, DeviceVerifyResponse } from './api/deviceApi';

export interface VerificationResult {
  success: boolean;
  isDuress?: boolean;
  challengeHex?: string;
  signatureHex?: string;
  error?: string;
}

export class UserVerificationService {
  /**
   * Prompts native OS Biometrics (FaceID/Fingerprint) using react-native-keychain.
   * STRICT SECURITY: Throws error on failure or cancellation. No fallback or mock bypass allowed.
   */
  public static async promptBiometricAuthentication(promptTitle: string): Promise<boolean> {
    try {
      // Check biometry hardware support
      const biometryType = await Keychain.getSupportedBiometryType();
      if (!biometryType) {
        throw new Error('HARDWARE_BIOMETRICS_NOT_SUPPORTED: Hardware biometric sensor unavailable.');
      }

      // Perform biometric prompt access
      const credentials = await Keychain.getGenericPassword({
        authenticationPrompt: {
          title: promptTitle,
          subtitle: 'Verify identity via hardware biometrics',
          description: 'Zero-Trust Safety Protocol Authorization',
          cancel: 'Cancel',
        },
      });

      if (credentials) {
        return true;
      }
      
      // If getGenericPassword returns false (canceled or rejected)
      throw new Error('BIOMETRIC_AUTH_CANCELLED: User canceled or failed biometric check.');
    } catch (error: any) {
      if (error.message && error.message.startsWith('HARDWARE_BIOMETRICS_NOT_SUPPORTED')) {
        throw error;
      }
      throw new Error(`BIOMETRIC_AUTH_FAILED: ${error.message || 'Biometric authentication failed.'}`);
    }
  }

  /**
   * Executes symmetric 2-step verification for Emergency Request Sender:
   * 1. OS Biometric check (FaceID/Fingerprint).
   * 2. Live 60-second Server Challenge Nonce + Ed25519 signature verification.
   * Supports Silent Duress PIN ('9999').
   */
  public static async verifySenderEmergencyTrigger(
    secretKeyBytes: Uint8Array,
    enteredPin?: string
  ): Promise<VerificationResult> {
    const isDuress = enteredPin === '9999';

    // 1. Mandatory Biometric Check (Strict, Zero-Fallback)
    await this.promptBiometricAuthentication('Authenticate SOS Emergency Signal Trigger');

    // 2. Fetch live 60s server challenge nonce
    const challengeRes = await deviceApi.requestChallenge();
    if (!challengeRes.success || !challengeRes.data?.challenge) {
      throw new Error('CHALLENGE_FETCH_FAILED: Server failed to issue single-use challenge nonce.');
    }

    const challengeHex = challengeRes.data.challenge;
    const challengeBuffer = Buffer.from(challengeHex);
    const signatureBytes = nacl.sign.detached(challengeBuffer, secretKeyBytes);
    const signatureHex = Buffer.from(signatureBytes).toString('hex');

    // 3. Server challenge-response verification
    const verifyRes: DeviceVerifyResponse = await deviceApi.verifyDevice(challengeHex, signatureHex);
    if (!verifyRes.success || !verifyRes.data?.verified) {
      throw new Error(`CHALLENGE_SIGNATURE_INVALID: ${verifyRes.data?.message || 'Server rejected challenge signature.'}`);
    }

    return {
      success: true,
      isDuress,
      challengeHex,
      signatureHex,
    };
  }

  /**
   * Executes symmetric 2-step verification for Emergency Acceptor / Responder:
   * 1. OS Biometric check (FaceID/Fingerprint).
   * 2. Live 60-second Server Challenge Nonce + Ed25519 signature verification.
   */
  public static async verifyAcceptorLiveness(
    secretKeyBytes: Uint8Array
  ): Promise<VerificationResult> {
    // 1. Mandatory Biometric Check (Strict, Zero-Fallback)
    await this.promptBiometricAuthentication('Authenticate Emergency Incident Acceptance');

    // 2. Fetch live 60s server challenge nonce
    const challengeRes = await deviceApi.requestChallenge();
    if (!challengeRes.success || !challengeRes.data?.challenge) {
      throw new Error('CHALLENGE_FETCH_FAILED: Server failed to issue single-use challenge nonce.');
    }

    const challengeHex = challengeRes.data.challenge;
    const challengeBuffer = Buffer.from(challengeHex);
    const signatureBytes = nacl.sign.detached(challengeBuffer, secretKeyBytes);
    const signatureHex = Buffer.from(signatureBytes).toString('hex');

    // 3. Server challenge-response verification
    const verifyRes: DeviceVerifyResponse = await deviceApi.verifyDevice(challengeHex, signatureHex);
    if (!verifyRes.success || !verifyRes.data?.verified) {
      throw new Error(`CHALLENGE_SIGNATURE_INVALID: ${verifyRes.data?.message || 'Server rejected challenge signature.'}`);
    }

    return {
      success: true,
      challengeHex,
      signatureHex,
    };
  }
}

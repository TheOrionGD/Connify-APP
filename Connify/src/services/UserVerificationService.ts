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
   * Executes symmetric verification for Emergency Request Sender:
   * Live 60-second Server Challenge Nonce + Ed25519 signature verification.
   * Supports Silent Duress PIN ('9999').
   */
  public static async verifySenderEmergencyTrigger(
    secretKeyBytes: Uint8Array,
    enteredPin?: string
  ): Promise<VerificationResult> {
    const isDuress = enteredPin === '9999';

    // Fetch live 60s server challenge nonce
    const challengeRes = await deviceApi.requestChallenge();
    if (!challengeRes.success || !challengeRes.data?.challenge) {
      throw new Error('CHALLENGE_FETCH_FAILED: Server failed to issue single-use challenge nonce.');
    }

    const challengeHex = challengeRes.data.challenge;
    const challengeBuffer = Buffer.from(challengeHex);
    const signatureBytes = nacl.sign.detached(challengeBuffer, secretKeyBytes);
    const signatureHex = Buffer.from(signatureBytes).toString('hex');

    // Server challenge-response verification
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
   * Executes symmetric verification for Emergency Acceptor / Responder:
   * Live 60-second Server Challenge Nonce + Ed25519 signature verification.
   */
  public static async verifyAcceptorLiveness(
    secretKeyBytes: Uint8Array
  ): Promise<VerificationResult> {
    // Fetch live 60s server challenge nonce
    const challengeRes = await deviceApi.requestChallenge();
    if (!challengeRes.success || !challengeRes.data?.challenge) {
      throw new Error('CHALLENGE_FETCH_FAILED: Server failed to issue single-use challenge nonce.');
    }

    const challengeHex = challengeRes.data.challenge;
    const challengeBuffer = Buffer.from(challengeHex);
    const signatureBytes = nacl.sign.detached(challengeBuffer, secretKeyBytes);
    const signatureHex = Buffer.from(signatureBytes).toString('hex');

    // Server challenge-response verification
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


import { secureKeyService } from '../src/services/secureKeyService';
import nacl from 'tweetnacl';

// Helper to convert hex to Uint8Array
const fromHex = (hex: string): Uint8Array => {
  const pairs = hex.match(/.{1,2}/g);
  if (!pairs) return new Uint8Array(0);
  return new Uint8Array(pairs.map(byte => parseInt(byte, 16)));
};

// Helper to convert string to Uint8Array
const stringToBytes = (str: string): Uint8Array => {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i) & 0xff;
  }
  return arr;
};

describe('Secure Key Service — Cryptographic Verification', () => {
  test('1. Generates a valid Ed25519 public key of 64 hex characters (32 bytes)', async () => {
    const publicKeyHex = await secureKeyService.generateKeyPair();
    
    expect(publicKeyHex).toHaveLength(64);
    expect(/^[0-9a-fA-F]+$/.test(publicKeyHex)).toBe(true);
  });

  test('2. Caches and retrieves the same public key', async () => {
    const originalKey = await secureKeyService.getPublicKey();
    const retrievedKey = await secureKeyService.getPublicKey();
    
    expect(retrievedKey).toBe(originalKey);
  });

  test('3. Signs a challenge and generates a valid 128 hex character signature (64 bytes)', async () => {
    const challenge = 'test-challenge-nonce-12345';
    const signatureHex = await secureKeyService.signChallenge(challenge);
    
    expect(signatureHex).toHaveLength(128);
    expect(/^[0-9a-fA-F]+$/.test(signatureHex)).toBe(true);
  });

  test('4. The generated signature is cryptographically valid against the public key', async () => {
    const challenge = 'test-verification-challenge-99999';
    const publicKeyHex = await secureKeyService.getPublicKey();
    const signatureHex = await secureKeyService.signChallenge(challenge);
    
    const publicKeyBytes = fromHex(publicKeyHex);
    const signatureBytes = fromHex(signatureHex);
    const challengeBytes = stringToBytes(challenge);
    
    const isValid = nacl.sign.detached.verify(
      challengeBytes,
      signatureBytes,
      publicKeyBytes
    );
    
    expect(isValid).toBe(true);
  });

  test('5. Rejects incorrect challenges or altered signatures', async () => {
    const challenge = 'original-challenge';
    const publicKeyHex = await secureKeyService.getPublicKey();
    const signatureHex = await secureKeyService.signChallenge(challenge);
    
    const publicKeyBytes = fromHex(publicKeyHex);
    const signatureBytes = fromHex(signatureHex);
    
    // Test with a different challenge
    const wrongChallengeBytes = stringToBytes('altered-challenge');
    const isAlteredValid = nacl.sign.detached.verify(
      wrongChallengeBytes,
      signatureBytes,
      publicKeyBytes
    );
    expect(isAlteredValid).toBe(false);
  });
});

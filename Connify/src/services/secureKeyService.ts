import nacl from 'tweetnacl';

// Helper functions for Hex conversion
const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');

const fromHex = (hex: string): Uint8Array => {
  const pairs = hex.match(/.{1,2}/g);
  if (!pairs) return new Uint8Array(0);
  return new Uint8Array(pairs.map(byte => parseInt(byte, 16)));
};

// Simple string to Uint8Array helper for compatibility across JS runtimes
const stringToBytes = (str: string): Uint8Array => {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i) & 0xff;
  }
  return arr;
};

// In-memory keypair storage acting as a secure hardware vault simulator
let cachedKeyPair: nacl.SignKeyPair | null = null;

export const secureKeyService = {
  /**
   * Generates a new Ed25519 key pair, simulating secure hardware storage.
   * Returns the Hex-encoded public key.
   */
  async generateKeyPair(): Promise<string> {
    const pair = nacl.sign.keyPair();
    cachedKeyPair = pair;
    // Public key is exposed, secret key is cached in-memory and never written to plaintext storage
    return toHex(pair.publicKey);
  },

  /**
   * Retrieves the stored public key or generates a new one if not present.
   */
  async getPublicKey(): Promise<string> {
    if (!cachedKeyPair) {
      return this.generateKeyPair();
    }
    return toHex(cachedKeyPair.publicKey);
  },

  /**
   * Signs a challenge string using the private key.
   * Returns the Hex-encoded signature.
   */
  async signChallenge(challenge: string): Promise<string> {
    if (!cachedKeyPair) {
      await this.generateKeyPair();
    }
    const messageBytes = stringToBytes(challenge);
    const signatureBytes = nacl.sign.detached(messageBytes, cachedKeyPair!.secretKey);
    return toHex(signatureBytes);
  },
};

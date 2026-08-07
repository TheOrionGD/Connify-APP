import nacl from 'tweetnacl';
import * as Keychain from 'react-native-keychain';

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

// Key format: public_key_hex:secret_key_hex
const KEYCHAIN_SERVICE = 'connify.ed25519.keypair';

// In-memory keypair storage acting as a secure hardware vault simulator
let cachedKeyPair: { publicKey: Uint8Array; secretKey: Uint8Array } | null = null;

export const secureKeyService = {
  /**
   * Generates a new Ed25519 key pair, securely storing it in iOS Keychain / Android Keystore.
   * Returns the Hex-encoded public key.
   */
  async generateKeyPair(): Promise<string> {
    const pair = nacl.sign.keyPair();
    cachedKeyPair = pair;
    
    const keyString = `${toHex(pair.publicKey)}:${toHex(pair.secretKey)}`;
    await Keychain.setGenericPassword('connify_device', keyString, {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    
    return toHex(pair.publicKey);
  },

  /**
   * Retrieves the stored public key or generates a new one if not present.
   */
  async getPublicKey(): Promise<string> {
    if (!cachedKeyPair) {
      await this.loadFromKeychain();
    }
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
      await this.loadFromKeychain();
    }
    if (!cachedKeyPair) {
      await this.generateKeyPair();
    }
    
    const messageBytes = stringToBytes(challenge);
    const signatureBytes = nacl.sign.detached(messageBytes, cachedKeyPair!.secretKey);
    return toHex(signatureBytes);
  },
  
  /**
   * Loads the Ed25519 keypair from the secure keychain into memory.
   */
  async loadFromKeychain(): Promise<void> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
      if (credentials && credentials.password) {
        const [pubHex, secHex] = credentials.password.split(':');
        if (pubHex && secHex) {
          cachedKeyPair = {
            publicKey: fromHex(pubHex),
            secretKey: fromHex(secHex),
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load keys from keychain', e);
    }
  }
};

/**
 * KeyService — Ed25519 JWT signing and verification for Connify.
 *
 * Uses `jose` (RFC-standard JOSE library) for Ed25519 operations.
 * Keys are loaded from environment variables in PEM format.
 *
 * First-run behaviour (development only):
 *   If JWT_PRIVATE_KEY / JWT_PUBLIC_KEY are absent, generates a new
 *   key pair, prints the PEM values to stdout, and exits — prompting
 *   the developer to paste them into .env before restarting.
 */
import {
  SignJWT,
  jwtVerify,
  importPKCS8,
  importSPKI,
  generateKeyPair,
  exportPKCS8,
  exportSPKI,
  type JWTPayload,
} from 'jose';
import { env } from '../config/env';

// Private and public CryptoKey objects loaded at startup
let privateKey: CryptoKey;
let publicKey: CryptoKey;
let initialized = false;

/**
 * Must be called once at server startup (before any route handles a request).
 * Loads keys from env vars, or generates + prints them in development.
 */
export async function initKeys(): Promise<void> {
  if (initialized) return;

  if (!env.JWT_PRIVATE_KEY || !env.JWT_PUBLIC_KEY) {
    if (env.NODE_ENV === 'development') {
      console.warn('\n⚠️  JWT_PRIVATE_KEY / JWT_PUBLIC_KEY not found in .env');
      console.warn('   Generating a new Ed25519 key pair for you...\n');

      const { privateKey: privKey, publicKey: pubKey } = await generateKeyPair(
        'EdDSA',
        { crv: 'Ed25519', extractable: true }
      );

      const privatePem = await exportPKCS8(privKey);
      const publicPem = await exportSPKI(pubKey);

      // Escape newlines so the keys can be pasted as single-line env vars
      const privateEscaped = privatePem.replace(/\n/g, '\\n');
      const publicEscaped = publicPem.replace(/\n/g, '\\n');

      console.log('📋 Paste these into your .env file, then restart:\n');
      console.log(`JWT_PRIVATE_KEY="${privateEscaped}"`);
      console.log(`JWT_PUBLIC_KEY="${publicEscaped}"`);
      console.log('');
      process.exit(0);
    }

    throw new Error(
      'JWT_PRIVATE_KEY and JWT_PUBLIC_KEY must be set in production'
    );
  }

  // Unescape \n back to real newlines (env vars stored with escaped newlines)
  privateKey = await importPKCS8(
    env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    'EdDSA'
  );
  publicKey = await importSPKI(
    env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
    'EdDSA'
  );

  initialized = true;
  console.log('🔑 Ed25519 signing keys loaded');
}

/**
 * Signs a payload into a compact JWS (JWT) using Ed25519.
 * @param payload   Claims to embed (avoid sensitive data).
 * @param expiresIn jose-compatible expiry string e.g. '7d', '2h', '30m'.
 */
export async function signToken(
  payload: Record<string, unknown>,
  expiresIn: string = '7d'
): Promise<string> {
  if (!initialized) {
    throw new Error('KeyService not initialized — call initKeys() first');
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'EdDSA' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(privateKey);
}

/**
 * Verifies a compact JWS token and returns its decoded payload.
 * Throws if the token is invalid, expired, or not signed with our key.
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  if (!initialized) {
    throw new Error('KeyService not initialized — call initKeys() first');
  }

  const { payload } = await jwtVerify(token, publicKey, {
    algorithms: ['EdDSA'],
  });
  return payload;
}

export function isInitialized(): boolean {
  return initialized;
}

/**
 * Fastify type augmentation — adds typed properties to FastifyRequest
 * so authenticated route handlers don't need `(req as any)` casts.
 */
import 'fastify';
import { DecodedIdToken } from 'firebase-admin/auth';

declare module 'fastify' {
  interface FastifyRequest {
    /**
     * Set by the `authenticate` preHandler after JWT verification.
     * Contains the decoded device session payload.
     */
    devicePayload?: {
      /** Device UUID */
      sub: string;
      /** SHA-256 fingerprint hash */
      fingerprint: string;
      /** Token type */
      type: string;
      [key: string]: unknown;
    };
    /**
     * Set by the `authenticateFirebase` preHandler after verifying Firebase ID token.
     */
    firebaseUser?: DecodedIdToken;
  }
}

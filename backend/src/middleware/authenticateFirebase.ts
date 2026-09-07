import type { FastifyRequest, FastifyReply } from 'fastify';
import { getFirebaseAuth } from '../config/firebase';

export async function authenticateFirebase(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authorization header missing or not a Bearer token',
      },
    });
  }

  const token = authHeader.slice(7).trim();

  try {
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(token);
    req.firebaseUser = decodedToken;
  } catch (error: any) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'INVALID_FIREBASE_TOKEN',
        message: error.message || 'Firebase ID token is invalid or has expired',
      },
    });
  }
}

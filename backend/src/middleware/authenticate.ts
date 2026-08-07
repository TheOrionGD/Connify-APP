/**
 * authenticate — Fastify preHandler hook for JWT bearer token verification.
 *
 * Reads the Authorization header, verifies the token with KeyService,
 * and attaches the decoded payload to `req.devicePayload`.
 * Returns 401 if the header is missing or the token is invalid/expired.
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../services/KeyService';

export async function authenticate(
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
    const payload = await verifyToken(token);
    req.devicePayload = payload as typeof req.devicePayload;
  } catch {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token is invalid or has expired',
      },
    });
  }
}

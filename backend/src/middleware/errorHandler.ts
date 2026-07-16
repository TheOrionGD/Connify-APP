/**
 * errorHandler — Fastify setErrorHandler callback.
 *
 * Normalises all errors into a consistent API shape:
 *   { success: false, error: { code, message, details? } }
 *
 * Handles:
 *  - Fastify validation errors (JSON Schema)
 *  - Errors with an explicit statusCode (thrown by route handlers)
 *  - Unexpected / unhandled errors (500)
 */
import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  // Log all errors (pino, configured in buildApp)
  request.log.error({ err: error }, error.message);

  // Fastify built-in JSON Schema validation errors
  if (error.validation) {
    reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.validation,
      },
    });
    return;
  }

  // Errors thrown with an explicit HTTP status (e.g. createError(404, ...))
  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 600) {
    reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code ?? 'APP_ERROR',
        message: error.message,
      },
    });
    return;
  }

  // Fallback — unexpected internal errors
  reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : error.message,
    },
  });
}

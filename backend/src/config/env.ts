/**
 * Typed environment config — validates all required env vars at startup.
 * Import this module first in server.ts so bad config fails fast.
 */
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce.number().int().min(1).max(65535).default(5000),

  // Database (Prisma Postgres or standard PostgreSQL URL)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis (Render Key Value or local Docker Redis)
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Ed25519 signing keys (PEM, newlines escaped as \n)
  // Leave unset on first run — KeyService will generate and print them.
  JWT_PRIVATE_KEY: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),

  JWT_PUBLIC_KEY: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),

  // Firebase Admin SDK Service Account JSON string
  FIREBASE_SERVICE_ACCOUNT_KEY: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('\n❌ Invalid environment variables:\n');
  console.error(JSON.stringify(result.error.format(), null, 2));
  process.exit(1);
}

export const env = result.data;
export type Env = typeof env;

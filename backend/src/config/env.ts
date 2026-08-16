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

  // Database (Prisma Postgres or standard PostgreSQL / MongoDB URL)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Ed25519 signing keys (PEM, newlines escaped as \n)
  JWT_PRIVATE_KEY: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v))
    .refine((val) => {
      if (process.env.NODE_ENV === 'production' && !val) return false;
      return true;
    }, { message: 'JWT_PRIVATE_KEY is required in production' }),

  JWT_PUBLIC_KEY: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v))
    .refine((val) => {
      if (process.env.NODE_ENV === 'production' && !val) return false;
      return true;
    }, { message: 'JWT_PUBLIC_KEY is required in production' }),

  // Firebase Admin SDK Service Account JSON string
  FIREBASE_SERVICE_ACCOUNT_KEY: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v))
    .refine((val) => {
      if (process.env.NODE_ENV === 'production' && !val) return false;
      return true;
    }, { message: 'FIREBASE_SERVICE_ACCOUNT_KEY is required in production' }),

  // Email Configuration
  BREVO_API_KEY: z.string().optional(),
  SMTP_USER: z.string().email().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('\n❌ FATAL: Invalid environment variables:\n');
  console.error(JSON.stringify(result.error.format(), null, 2));
  process.exit(1);
}

export const env = result.data;
export type Env = typeof env;


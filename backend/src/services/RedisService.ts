/**
 * RedisService — ioredis singleton for general-purpose Redis operations.
 *
 * Provides:
 *  - A shared client for caching and capsule single-use locks.
 *  - `createBullMQConnection()` for BullMQ Queue/Worker — separate
 *    connections are required because BullMQ uses blocking commands
 *    (BLPOP) that would monopolise a shared connection.
 */
import Redis from 'ioredis';
import { env } from '../config/env';

let sharedClient: Redis | null = null;

/**
 * Returns the shared ioredis client used for locks, health checks, etc.
 * Creates it lazily on first call.
 */
export function getRedisClient(): Redis {
  if (!sharedClient) {
    sharedClient = new Redis(env.REDIS_URL, {
      // BullMQ-compatible setting (also harmless for general use)
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: false,
    });

    sharedClient.on('connect', () =>
      console.log('🔴 Redis connected:', env.REDIS_URL)
    );
    sharedClient.on('error', (err) =>
      console.error('Redis error:', err.message)
    );
  }

  return sharedClient;
}

/**
 * Creates a NEW ioredis connection dedicated for use by a BullMQ Queue
 * or Worker. Each caller gets an independent connection.
 */
export function createBullMQConnection(): Redis {
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

/**
 * Pings Redis to verify connectivity. Call from server.ts startup.
 * Returns true on success, false if Redis is unavailable.
 */
export async function pingRedis(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch {
    return false;
  }
}

// ── Capsule single-use lock (double-spend prevention) ─────────────────
// Uses `SET NX EX` — atomic, so two simultaneous redemptions can't both
// succeed. This is the Redis equivalent of a distributed mutex.

/**
 * Acquires a single-use lock for a capsule.
 * @returns true if the lock was set (first redemption), false if already locked.
 */
export async function setCapsuleLock(
  capsuleId: string,
  ttlSeconds: number
): Promise<boolean> {
  const client = getRedisClient();
  const result = await client.set(
    `capsule:lock:${capsuleId}`,
    'used',
    'EX',
    ttlSeconds,
    'NX'
  );
  return result === 'OK';
}

/** Returns true if the capsule has already been redeemed. */
export async function checkCapsuleLock(capsuleId: string): Promise<boolean> {
  const client = getRedisClient();
  const val = await client.get(`capsule:lock:${capsuleId}`);
  return val === 'used';
}

/** Removes the capsule lock (on revocation). */
export async function deleteCapsuleLock(capsuleId: string): Promise<void> {
  const client = getRedisClient();
  await client.del(`capsule:lock:${capsuleId}`);
}

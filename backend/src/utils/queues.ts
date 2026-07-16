/**
 * BullMQ Queue definitions and scheduling helpers.
 *
 * Each Queue uses its own dedicated ioredis connection — required because
 * BullMQ may use blocking commands internally and the connection must not
 * be shared with other operations.
 */
import { Queue } from 'bullmq';
import { createBullMQConnection } from '../services/RedisService';

// ── Queue instances (lazily created) ──────────────────────────────────

let _capsuleExpiryQueue: Queue | null = null;
let _matchTimeoutQueue: Queue | null = null;

export function getCapsuleExpiryQueue(): Queue {
  if (!_capsuleExpiryQueue) {
    _capsuleExpiryQueue = new Queue('capsule-expiry', {
      connection: createBullMQConnection() as any,
      defaultJobOptions: { removeOnComplete: true, removeOnFail: 50 },
    });
  }
  return _capsuleExpiryQueue;
}

export function getMatchTimeoutQueue(): Queue {
  if (!_matchTimeoutQueue) {
    _matchTimeoutQueue = new Queue('match-timeout', {
      connection: createBullMQConnection() as any,
      defaultJobOptions: { removeOnComplete: true, removeOnFail: 50 },
    });
  }
  return _matchTimeoutQueue;
}

// ── Scheduling helpers ────────────────────────────────────────────────

/**
 * Schedules a capsule-expiry job to fire after `delayMs`.
 * Uses the capsuleId as the jobId so duplicate schedules are de-duped.
 */
export async function scheduleCapsuleExpiry(
  capsuleId: string,
  delayMs: number
): Promise<void> {
  await getCapsuleExpiryQueue().add(
    'expire-capsule',
    { capsuleId },
    {
      delay: delayMs,
      jobId: `capsule-expiry:${capsuleId}`,
    }
  );
}

/**
 * Schedules a match-timeout job for an episode that hasn't been matched yet.
 * If a match is found before the delay, the job simply becomes a no-op
 * (the episode's status will already be 'matched' when the worker runs).
 */
export async function scheduleMatchTimeout(
  episodeId: string,
  delayMs: number
): Promise<void> {
  await getMatchTimeoutQueue().add(
    'timeout-match',
    { episodeId },
    {
      delay: delayMs,
      jobId: `match-timeout:${episodeId}`,
    }
  );
}

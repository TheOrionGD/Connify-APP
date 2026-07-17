/**
 * capsuleExpiryWorker — BullMQ worker that processes capsule expiration.
 *
 * Runs asynchronously to:
 *  1. Check if the capsule is still active (issued or redeemed).
 *  2. Mark it as expired in the database.
 *  3. If the associated episode is active or matched, mark it as expired.
 *  4. Delete the Redis single-use lock.
 *  5. Broadcast a Socket.IO teardown event to terminate the chat room.
 */
import { Worker, type Job } from 'bullmq';
import { createBullMQConnection, deleteCapsuleLock } from '../services/RedisService';
import { prisma } from '../utils/prisma';
import { emitEpisodeExpired } from '../sockets';

interface CapsuleExpiryJobData {
  capsuleId: string;
}

let worker: Worker | null = null;

export function initCapsuleExpiryWorker(): Worker {
  if (worker) return worker;

  worker = new Worker<CapsuleExpiryJobData>(
    'capsule-expiry',
    async (job: Job<CapsuleExpiryJobData>) => {
      const { capsuleId } = job.data;
      console.log(`⏰ Processing capsule expiry job: ${capsuleId}`);

      try {
        const capsule = await prisma.capsule.findUnique({
          where: { id: capsuleId },
          include: { episode: true },
        });

        if (!capsule) {
          console.warn(`⚠️ Capsule ${capsuleId} not found in database`);
          return;
        }

        // If it's already completed or cancelled, do nothing
        if (['expired', 'revoked'].includes(capsule.status)) {
          console.log(`Capsule ${capsuleId} is already in final state: ${capsule.status}`);
          return;
        }

        await prisma.$transaction(async (tx) => {
          // 1. Mark capsule as expired
          await tx.capsule.update({
            where: { id: capsuleId },
            data: { status: 'expired' },
          });

          // 2. If the associated episode is matched or active (and not completed/cancelled),
          // mark the episode as expired.
          if (['matched', 'active'].includes(capsule.episode.status)) {
            await tx.episode.update({
              where: { id: capsule.episodeId },
              data: { status: 'expired' },
            });
          }
        });

        // 3. Clear Redis lock
        await deleteCapsuleLock(capsuleId).catch((err) =>
          console.error(`Failed to delete Redis lock for capsule ${capsuleId}:`, err.message)
        );

        // 4. Tear down the Socket.IO room and notify clients
        emitEpisodeExpired(capsule.episodeId);

        console.log(`✅ Capsule ${capsuleId} and episode ${capsule.episodeId} successfully expired`);
      } catch (err: any) {
        console.error(`❌ Error in capsule expiry worker for job ${job.id}:`, err.message);
        throw err;
      }
    },
    {
      connection: createBullMQConnection() as any,
      concurrency: 2,
    }
  );

  worker.on('active', (job) => console.log(`Worker active: capsule-expiry - Job ${job.id}`));
  worker.on('completed', (job) => console.log(`Worker completed: capsule-expiry - Job ${job.id}`));
  worker.on('failed', (job, err) => console.error(`Worker failed: capsule-expiry - Job ${job?.id}:`, err.message));

  return worker;
}

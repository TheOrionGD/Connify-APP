/**
 * matchTimeoutWorker — BullMQ worker that processes episode match timeouts.
 *
 * Runs asynchronously to:
 *  1. Check if the episode is still in 'pending' status after the timeout window (e.g. 5 minutes).
 *  2. Transition the episode status to 'expired' if no helper matched in time.
 */
import { Worker, type Job } from 'bullmq';
import { createBullMQConnection } from '../services/RedisService';
import { prisma } from '../utils/prisma';

interface MatchTimeoutJobData {
  episodeId: string;
}

let worker: Worker | null = null;

export function initMatchTimeoutWorker(): Worker {
  if (worker) return worker;

  worker = new Worker<MatchTimeoutJobData>(
    'match-timeout',
    async (job: Job<MatchTimeoutJobData>) => {
      const { episodeId } = job.data;
      console.log(`⏰ Processing match timeout job: ${episodeId}`);

      try {
        const episode = await prisma.episode.findUnique({
          where: { id: episodeId },
        });

        if (!episode) {
          console.warn(`⚠️ Episode ${episodeId} not found in database`);
          return;
        }

        // If the episode is still pending, it has failed to match in time
        if (episode.status === 'pending') {
          await prisma.episode.update({
            where: { id: episodeId },
            data: { status: 'expired' },
          });
          console.log(`✅ Episode ${episodeId} marked as expired due to match timeout`);
        } else {
          console.log(`Episode ${episodeId} status is '${episode.status}' — match timeout ignored`);
        }
      } catch (err: any) {
        console.error(`❌ Error in match timeout worker for job ${job.id}:`, err.message);
        throw err;
      }
    },
    {
      connection: createBullMQConnection() as any,
      concurrency: 2,
    }
  );

  worker.on('active', (job) => console.log(`Worker active: match-timeout - Job ${job.id}`));
  worker.on('completed', (job) => console.log(`Worker completed: match-timeout - Job ${job.id}`));
  worker.on('failed', (job, err) => console.error(`Worker failed: match-timeout - Job ${job?.id}:`, err.message));

  return worker;
}

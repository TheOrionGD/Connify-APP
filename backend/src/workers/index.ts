/**
 * Central initializer for all BullMQ workers.
 * Call from server.ts startup to begin processing queue jobs.
 */
import { initCapsuleExpiryWorker } from './capsuleExpiryWorker';
import { initMatchTimeoutWorker } from './matchTimeoutWorker';

export function startWorkers(): void {
  console.log('👷 Starting BullMQ workers...');
  initCapsuleExpiryWorker();
  initMatchTimeoutWorker();
  console.log('✅ BullMQ workers listening for jobs');
}

import { AuditLog } from '../models';
import { createHash } from 'node:crypto';

/**
 * Appends a new event to the tamper-evident audit log ledger.
 * Reconstructs the hash-chain by hashing the previous entry's hash
 * combined with the current event data.
 */
let auditQueue = Promise.resolve();

export function writeAuditLog(
  eventType: string,
  episodeId: string | null
): Promise<void> {
  const task = async () => {
    try {
      const lastLog = await AuditLog.findOne().sort({ _id: -1 });

      const prevHash = lastLog ? lastLog.entryHash : '0';

      const episodeIdStr = episodeId ? episodeId.toString() : '';
      const content = `${prevHash}:${eventType}:${episodeIdStr}`;
      const entryHash = createHash('sha256').update(content).digest('hex');

      await AuditLog.create({
        eventType,
        episodeId: episodeId || undefined,
        prevHash,
        entryHash,
      });

      console.log(`🔐 Cryptographic audit log written: [${eventType}] (episode: ${episodeId})`);
    } catch (error) {
      console.error('⚠️ Failed to write cryptographic audit log:', error);
    }
  };

  auditQueue = auditQueue.then(task).catch(task);
  return auditQueue;
}

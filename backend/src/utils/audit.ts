import { AuditLog } from '../models';
import { createHash } from 'node:crypto';

/**
 * Appends a new event to the tamper-evident audit log ledger.
 * Reconstructs the hash-chain by hashing the previous entry's hash
 * combined with the current event data.
 */
export async function writeAuditLog(
  eventType: string,
  episodeId: string | null
): Promise<void> {
  try {
    // 1. Get the last log entry to retrieve its hash
    const lastLog = await AuditLog.findOne().sort({ _id: -1 });

    const prevHash = lastLog ? lastLog.entryHash : '0';

    // 2. Compute the current entry hash: SHA-256(prevHash + ":" + eventType + ":" + episodeId)
    const content = `${prevHash}:${eventType}:${episodeId ?? ''}`;
    const entryHash = createHash('sha256').update(content).digest('hex');

    // 3. Create the log entry
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
}

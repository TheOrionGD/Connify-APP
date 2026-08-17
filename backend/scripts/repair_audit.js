"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../src/utils/db");
const index_1 = require("../src/models/index");
const node_crypto_1 = require("node:crypto");
async function repairAuditChain() {
    await (0, db_1.connectDB)();
    console.log('Connected to DB. Repairing AuditLog chain...');
    const logs = await index_1.AuditLog.find().sort({ _id: 1 });
    let prevHash = '0';
    for (const log of logs) {
        const episodeIdStr = log.episodeId ? log.episodeId.toString() : '';
        const content = `${prevHash}:${log.eventType}:${episodeIdStr}`;
        const entryHash = (0, node_crypto_1.createHash)('sha256').update(content).digest('hex');
        log.prevHash = prevHash;
        log.entryHash = entryHash;
        await log.save();
        prevHash = entryHash;
    }
    console.log('AuditLog chain successfully repaired!');
    process.exit(0);
}
repairAuditChain().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=repair_audit.js.map
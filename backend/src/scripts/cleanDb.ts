import { prisma } from '../utils/prisma';
import { connectDB } from '../utils/db';

async function cleanDatabase() {
  try {
    await connectDB();
    console.log('🧹 Clearing stale database state...');

    const capsulesCount = await prisma.capsule.deleteMany({});
    console.log(`Deleted ${capsulesCount.count} capsules.`);

    const episodesCount = await prisma.episode.deleteMany({});
    console.log(`Deleted ${episodesCount.count} episodes.`);

    const outcomesCount = await prisma.outcome.deleteMany({});
    console.log(`Deleted ${outcomesCount.count} outcomes.`);

    const auditCount = await prisma.auditLog.deleteMany({});
    console.log(`Deleted ${auditCount.count} audit logs.`);

    console.log('✅ Database state cleaned successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
}

cleanDatabase();

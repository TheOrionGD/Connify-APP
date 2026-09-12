import { prisma } from '../utils/prisma';
import { connectDB } from '../utils/db';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';

async function cleanDatabase() {
  try {
    await connectDB();
    console.log('🧹 Clearing stale database & profile state...');

    const capsulesCount = await prisma.capsule.deleteMany({});
    console.log(`Deleted ${capsulesCount.count} capsules.`);

    const episodesCount = await prisma.episode.deleteMany({});
    console.log(`Deleted ${episodesCount.count} episodes.`);

    const outcomesCount = await prisma.outcome.deleteMany({});
    console.log(`Deleted ${outcomesCount.count} outcomes.`);

    const auditCount = await prisma.auditLog.deleteMany({});
    console.log(`Deleted ${auditCount.count} audit logs.`);

    const profilesCount = await prisma.profile.deleteMany({});
    console.log(`Deleted ${profilesCount.count} profiles.`);

    const devicesCount = await prisma.device.deleteMany({});
    console.log(`Deleted ${devicesCount.count} devices.`);

    // Firebase Auth user cleanup
    try {
      const serviceAccountPath = path.join(__dirname, '..', '..', 'connify-2026-firebase-adminsdk-fbsvc-0ac0df4f28.json');
      const serviceAccount = require(serviceAccountPath);
      if (getApps().length === 0) {
        initializeApp({
          credential: cert(serviceAccount),
        });
      }
      const auth = getAuth();
      const listUsersResult = await auth.listUsers(1000);
      const uids = listUsersResult.users.map(u => u.uid);
      if (uids.length > 0) {
        const deleteResult = await auth.deleteUsers(uids);
        console.log(`Successfully deleted ${deleteResult.successCount} Firebase Auth users.`);
      } else {
        console.log('No Firebase Auth users found to delete.');
      }
    } catch (fbErr) {
      console.warn('Firebase Auth cleanup notice:', fbErr);
    }

    console.log('✅ Database state cleaned successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
}

cleanDatabase();


/**
 * Connify Backend Server Entry Point
 *
 * Startup Sequence:
 *  1. Validate environment variables (config/env)
 *  2. Initialise cryptographic key management (KeyService)
 *  3. Build Fastify application (app)
 *  4. Initialise Socket.IO real-time engine
 *  5. Start BullMQ background queue workers
 *  6. Bind HTTP & WebSocket listeners to PORT
 */
import { env } from './config/env';
import { initKeys } from './services/KeyService';
import { initFirebase } from './config/firebase';
import { buildApp } from './app';
import { initSockets } from './sockets';
import { connectDB } from './utils/db';
import { LocationWatchdogService } from './services/LocationWatchdogService';

const start = async () => {
  try {
    // 0. Connect to MongoDB Atlas
    await connectDB();

    // 1. Load and verify keys
    await initKeys();

    // 1.5 Initialize Firebase Admin SDK
    initFirebase();

    // 2. Build Fastify app
    const appInstance = buildApp();

    // 3. Wait for app ready to access server instance
    await appInstance.ready();

    // 4. Initialise Socket.IO attaching to the underlying HTTP server
    await initSockets(appInstance.server);

    // 5. Listen
    const address = await appInstance.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 Server listening on ${address}`);

    // 6. Start the Location Watchdog Scanner
    setInterval(async () => {
      try {
        await LocationWatchdogService.checkSignalLossAndNotifyGuardians();
      } catch (err) {
        console.error('❌ Watchdog scan failed:', err);
      }
    }, 10000); // Scan every 10 seconds

  } catch (err: any) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
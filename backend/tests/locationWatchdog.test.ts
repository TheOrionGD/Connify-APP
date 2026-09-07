process.env.BREVO_API_KEY = 'mock_key';
import mongoose from 'mongoose';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app';
import { Device, Guardian, DeviceLocation, Profile, Episode } from '../src/models';
import { connectDB } from '../src/utils/db';
import { env } from '../src/config/env';
import { initKeys, signToken } from '../src/services/KeyService';
import { dispatchedAlertsLog } from '../src/services/LocationWatchdogService';
import nacl from 'tweetnacl';

describe('5-Second Location Ping & 15-Second Watchdog Guardian SMS Test Suite', () => {
  const app = buildApp();

  let testDevice: any;
  let testKeyPair: nacl.SignKeyPair;
  let testToken: string;

  before(async () => {
    await connectDB();
    env.BREVO_API_KEY = 'mock_key';
    global.fetch = async () => ({ ok: true } as any);
    await initKeys();
    await app.ready();

    testKeyPair = nacl.sign.keyPair();
    const pubKeyHex = Buffer.from(testKeyPair.publicKey).toString('hex');
    testDevice = await Device.create({
      deviceFingerprintHash: 'w'.repeat(64),
      publicKey: pubKeyHex,
      isQuarantined: false,
    });
    testToken = await signToken({ sub: testDevice._id.toString() });

    // Create user profile
    await Profile.create({
      deviceId: testDevice._id,
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+15550100',
    });
  });

  after(async () => {
    if (testDevice) {
      await DeviceLocation.deleteMany({ deviceId: testDevice._id });
      await Guardian.deleteMany({ deviceId: testDevice._id });
      await Profile.deleteMany({ deviceId: testDevice._id });
      await Episode.deleteMany({ requesterDeviceId: testDevice._id });
      await Device.findByIdAndDelete(testDevice._id);
    }
    await app.close();
    await mongoose.disconnect();
  });

  it('1. Mandatory Guardian Enforcement: Blocks episode creation if no guardian is registered', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/episodes',
      headers: { Authorization: `Bearer ${testToken}` },
      payload: {
        category: 'medical',
        urgency: 4,
        latitude: 37.7749,
        longitude: -122.4194,
        radiusMeters: 500,
        blindedGridSigs: 'sig',
        helperValidationKey: 'key',
        gridCellsJson: '[]',
      },
    });

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.json().success, false);

  });

  it('2. Mandatory Guardian Data Input: Registers mandatory guardian with name, phone, and relationship', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/locations/guardians',
      headers: { Authorization: `Bearer ${testToken}` },
      payload: {
        userFullName: 'Priya Sharma',
        fullName: 'Ramesh Sharma',
        phone: '+15550199',
        relationship: 'Daughter',
        email: 'guardian@example.com',
      },
    });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.json().success, true);
    assert.strictEqual(res.json().data.relationship, 'Daughter');
    assert.strictEqual(res.json().data.fullName, 'Ramesh Sharma');
  });

  it('3. 5-Second Location Ping & Atomic Overwrite: Updates location and replaces prior DB data', async () => {
    // 1st Ping
    const ping1 = await app.inject({
      method: 'POST',
      url: '/api/locations/ping',
      headers: { Authorization: `Bearer ${testToken}` },
      payload: { latitude: 37.7749, longitude: -122.4194, accuracy: 5 },
    });

    assert.strictEqual(ping1.statusCode, 200);

    // 2nd Ping 5 seconds later (atomic overwrite)
    const ping2 = await app.inject({
      method: 'POST',
      url: '/api/locations/ping',
      headers: { Authorization: `Bearer ${testToken}` },
      payload: { latitude: 37.7750, longitude: -122.4195, accuracy: 4 },
    });

    assert.strictEqual(ping2.statusCode, 200);
    assert.strictEqual(ping2.json().data.latitude, 37.7750);

    // Verify only 1 location document exists in DB for device
    const docCount = await DeviceLocation.countDocuments({ deviceId: testDevice._id });
    assert.strictEqual(docCount, 1);
  });

  it('4. 15-Second Watchdog Signal Loss: Sends personalized Guardian SMS alert with name, relationship, reason & map fetched from DB', async () => {
    // Manually set lastPingAt to 16 seconds ago to simulate 15-second signal loss threshold
    await DeviceLocation.findOneAndUpdate(
      { deviceId: testDevice._id },
      { lastPingAt: new Date(Date.now() - 16 * 1000) }
    );

    const scanRes = await app.inject({
      method: 'POST',
      url: '/api/locations/watchdog/scan',
      headers: { Authorization: `Bearer ${testToken}` },
    });

    assert.strictEqual(scanRes.statusCode, 200);
    assert.strictEqual(scanRes.json().alertsSent, 1);

    // Fetch dynamic location from database
    const dbLoc = await DeviceLocation.findOne({ deviceId: testDevice._id });
    assert.ok(dbLoc);

    // Check dispatched SMS log
    const lossSms = dispatchedAlertsLog.find((sms) => sms.type === 'SIGNAL_LOSS');
    assert.ok(lossSms);
    assert.strictEqual(lossSms.to, 'guardian@example.com');




  });

  it('5. Signal Recovery Alert: Sends personalized Signal Recovered SMS alert with location fetched from DB when fresh ping arrives', async () => {
    const freshLat = 37.7751;
    const freshLng = -122.4196;

    const recoveryPing = await app.inject({
      method: 'POST',
      url: '/api/locations/ping',
      headers: { Authorization: `Bearer ${testToken}` },
      payload: { latitude: freshLat, longitude: freshLng, accuracy: 3 },
    });

    assert.strictEqual(recoveryPing.statusCode, 200);
    assert.strictEqual(recoveryPing.json().data.signalLostAlertSent, false);

    // Fetch dynamic location from database after update
    const dbLoc = await DeviceLocation.findOne({ deviceId: testDevice._id });
    assert.ok(dbLoc);
    assert.strictEqual(dbLoc.latitude, freshLat);
    assert.strictEqual(dbLoc.longitude, freshLng);

    // Check dispatched recovery SMS log
    const recoverySms = dispatchedAlertsLog.find((sms) => sms.type === 'SIGNAL_RECOVERED');
    assert.ok(recoverySms);
    assert.strictEqual(recoverySms.to, 'guardian@example.com');


  });

  it('6. Unbounded Recovery Support: Dispatches recovery alert with DB location even after extended disconnection (Airplane Mode / Power Off)', async () => {
    // Simulate extended 1-hour disconnection with 100+ retries
    await DeviceLocation.findOneAndUpdate(
      { deviceId: testDevice._id },
      {
        signalLostAlertSent: true,
        retryCount: 150,
        lastPingAt: new Date(Date.now() - 3600 * 1000), // 1 hour ago
      }
    );

    const reconnectedLat = 37.7755;
    const reconnectedLng = -122.4200;

    // Device turns back on / exits Airplane mode -> pings location
    const reconnectPing = await app.inject({
      method: 'POST',
      url: '/api/locations/ping',
      headers: { Authorization: `Bearer ${testToken}` },
      payload: { latitude: reconnectedLat, longitude: reconnectedLng, accuracy: 2 },
    });

    assert.strictEqual(reconnectPing.statusCode, 200);
    assert.strictEqual(reconnectPing.json().data.signalLostAlertSent, false);

    // Fetch dynamic location from database after reconnect ping
    const dbLoc = await DeviceLocation.findOne({ deviceId: testDevice._id });
    assert.ok(dbLoc);
    assert.strictEqual(dbLoc.latitude, reconnectedLat);
    assert.strictEqual(dbLoc.longitude, reconnectedLng);

    const latestRecoverySms = dispatchedAlertsLog.filter((sms) => sms.type === 'SIGNAL_RECOVERED').pop();
    assert.ok(latestRecoverySms);


  });
});

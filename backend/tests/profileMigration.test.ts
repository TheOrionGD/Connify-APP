import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app';
import { Device, Profile, Guardian, DeviceLocation, Episode } from '../src/models';
import { connectDB } from '../src/utils/db';
import { initKeys, signToken } from '../src/services/KeyService';
import { dispatchedSmsLog } from '../src/services/LocationWatchdogService';
import nacl from 'tweetnacl';

describe('Anonymous-to-Registered Profile Migration Integration Test Suite', () => {
  const app = buildApp();

  let testDevice: any;
  let testKeyPair: nacl.SignKeyPair;
  let testToken: string;

  before(async () => {
    await connectDB();
    await initKeys();
    await app.ready();

    // Create anonymous device
    testKeyPair = nacl.sign.keyPair();
    const pubKeyHex = Buffer.from(testKeyPair.publicKey).toString('hex');
    testDevice = await Device.create({
      deviceFingerprintHash: 'm'.repeat(64),
      publicKey: pubKeyHex,
      isQuarantined: false,
    });
    testToken = await signToken({ sub: testDevice._id.toString() });

    // Create initial anonymous profile
    await Profile.create({
      deviceId: testDevice._id,
      firstName: 'Anonymous',
      lastName: 'User',
      isAnonymous: true,
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
  });

  it('1. Anonymous State Baseline: Anonymous user is blocked from emergency episode trigger due to missing guardian', async () => {
    const epRes = await app.inject({
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

    assert.strictEqual(epRes.statusCode, 500);
    assert.strictEqual(epRes.json().success, false);
    assert.ok(epRes.json().error.message.includes('GUARDIAN_REQUIRED'));
  });

  it('2. Profile Upgrade Endpoint: Migrates anonymous profile to registered user with mandatory guardian and Firebase UID', async () => {
    const upgradeRes = await app.inject({
      method: 'POST',
      url: '/api/profile/upgrade',
      headers: { Authorization: `Bearer ${testToken}` },
      payload: {
        firebaseUid: 'firebase_uid_12345',
        firstName: 'Ananya',
        lastName: 'Verma',
        phone: '+15550222',
        email: 'ananya@example.com',
        guardian: {
          fullName: 'Sanjay Verma',
          phone: '+15550299',
          relationship: 'Father',
        },
      },
    });

    assert.strictEqual(upgradeRes.statusCode, 200);
    assert.strictEqual(upgradeRes.json().success, true);
    assert.strictEqual(upgradeRes.json().data.profile.isAnonymous, false);
    assert.strictEqual(upgradeRes.json().data.profile.firebaseUid, 'firebase_uid_12345');
    assert.strictEqual(upgradeRes.json().data.guardian.relationship, 'Father');
  });

  it('3. MongoDB State Verification: Profile is updated to registered state and Guardian is bound to deviceId', async () => {
    const dbProfile = await Profile.findOne({ deviceId: testDevice._id });
    assert.ok(dbProfile);
    assert.strictEqual(dbProfile.isAnonymous, false);
    assert.strictEqual(dbProfile.firstName, 'Ananya');
    assert.strictEqual(dbProfile.lastName, 'Verma');
    assert.strictEqual(dbProfile.email, 'ananya@example.com');
    assert.strictEqual(dbProfile.firebaseUid, 'firebase_uid_12345');

    const dbGuardian = await Guardian.findOne({ deviceId: testDevice._id });
    assert.ok(dbGuardian);
    assert.strictEqual(dbGuardian.userFullName, 'Ananya Verma');
    assert.strictEqual(dbGuardian.fullName, 'Sanjay Verma');
    assert.strictEqual(dbGuardian.relationship, 'Father');
  });

  it('4. Post-Upgrade Episode Creation: Emergency episode creation succeeds cleanly for upgraded registered user', async () => {
    const epRes = await app.inject({
      method: 'POST',
      url: '/api/episodes',
      headers: { Authorization: `Bearer ${testToken}` },
      payload: {
        category: 'medical',
        urgency: 4,
        latitude: 37.7749,
        longitude: -122.4194,
        radiusMeters: 500,
        blindedGridSigs: 'sig_upgraded',
        helperValidationKey: 'key_upgraded',
        gridCellsJson: JSON.stringify(['cell_upgraded']),
      },
    });

    assert.strictEqual(epRes.statusCode, 201);
    assert.strictEqual(epRes.json().success, true);
  });

  it('5. Personalized Watchdog Alert Check: Uses upgraded full name & relationship in Guardian SMS', async () => {
    // Set 5s location ping
    await app.inject({
      method: 'POST',
      url: '/api/locations/ping',
      headers: { Authorization: `Bearer ${testToken}` },
      payload: { latitude: 37.7749, longitude: -122.4194 },
    });

    // Simulate 15s signal loss
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

    const latestLossSms = dispatchedSmsLog.filter((sms) => sms.type === 'SIGNAL_LOSS').pop();
    assert.ok(latestLossSms);
    assert.strictEqual(latestLossSms.toPhone, '+15550299');
    assert.ok(latestLossSms.message.includes('your Father, Ananya Verma'));
  });
});

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app';
import { Device, Episode } from '../src/models';
import { connectDB } from '../src/utils/db';
import { initKeys, signToken } from '../src/services/KeyService';
import nacl from 'tweetnacl';

describe('5-Pillar Harmlessness & Threat Assessment System Test Suite', () => {
  const app = buildApp();

  let testDevice: any;
  let testKeyPair: nacl.SignKeyPair;
  let testToken: string;

  let responderDevice: any;
  let responderToken: string;

  before(async () => {
    await connectDB();
    await initKeys();
    await app.ready();

    // Create main test device
    testKeyPair = nacl.sign.keyPair();
    const pubKeyHex = Buffer.from(testKeyPair.publicKey).toString('hex');
    testDevice = await Device.create({
      deviceFingerprintHash: 'h'.repeat(64),
      publicKey: pubKeyHex,
      isQuarantined: false,
      suspiciousCount: 0,
      harmlessnessScore: 100,
    });
    testToken = await signToken({ sub: testDevice._id.toString() });

    // Register mandatory guardian for test device
    const { Guardian } = await import('../src/models');
    await Guardian.create({
      deviceId: testDevice._id,
      userFullName: 'Test User',
      fullName: 'Guardian User',
      phone: '+15550100',
      relationship: 'Parent',
    });

    // Create responder device
    const responderKeyPair = nacl.sign.keyPair();
    responderDevice = await Device.create({
      deviceFingerprintHash: 'r'.repeat(64),
      publicKey: Buffer.from(responderKeyPair.publicKey).toString('hex'),
      isQuarantined: false,
    });
    responderToken = await signToken({ sub: responderDevice._id.toString() });
  });

  after(async () => {
    if (testDevice) {
      const { Guardian } = await import('../src/models');
      await Guardian.deleteMany({ deviceId: testDevice._id });
      await Episode.deleteMany({ requesterDeviceId: testDevice._id });
      await Device.findByIdAndDelete(testDevice._id);
    }
    if (responderDevice) {
      await Device.findByIdAndDelete(responderDevice._id);
    }
    await app.close();
  });

  it('1. Trap & Velocity Detection: Allows valid 1st episode creation', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/episodes',
      headers: { Authorization: `Bearer ${testToken}` },
      payload: {
        category: 'medical',
        urgency: 4,
        context: 'First episode request',
        latitude: 37.7749,
        longitude: -122.4194,
        radiusMeters: 500,
        blindedGridSigs: '0x_sig_1',
        helperValidationKey: '0x_key_1',
        gridCellsJson: JSON.stringify(['cell_1']),
      },
    });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.json().success, true);
  });

  it('2. Trap & Velocity Detection: Allows valid 2nd episode creation within window', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/episodes',
      headers: { Authorization: `Bearer ${testToken}` },
      payload: {
        category: 'general',
        urgency: 3,
        context: 'Second episode request',
        latitude: 37.7750,
        longitude: -122.4195,
        radiusMeters: 500,
        blindedGridSigs: '0x_sig_2',
        helperValidationKey: '0x_key_2',
        gridCellsJson: JSON.stringify(['cell_2']),
      },
    });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.json().success, true);
  });

  it('3. Trap & Velocity Defense: REJECTS 3rd rapid episode in 10-minute window (Predatory Luring Prevention)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/episodes',
      headers: { Authorization: `Bearer ${testToken}` },
      payload: {
        category: 'emergency',
        urgency: 5,
        context: 'Rapid 3rd episode request',
        latitude: 37.7751,
        longitude: -122.4196,
        radiusMeters: 500,
        blindedGridSigs: '0x_sig_3',
        helperValidationKey: '0x_key_3',
        gridCellsJson: JSON.stringify(['cell_3']),
      },
    });

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.json().success, false);
    assert.ok(res.json().error.message.includes('PREDATORY_LURING_DETECTED'));
  });

  it('4. Responder Threat Abort: Responders can panic abort an episode and flag suspicious senders', async () => {
    const episode = await Episode.create({
      requesterDeviceId: testDevice._id,
      category: 'general',
      urgency: 3,
      status: 'active',
      latitude: 37.7749,
      longitude: -122.4194,
      location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      radiusMeters: 500,
      blindedGridSigs: 'sig_abort',
      helperValidationKey: 'key_abort',
      gridCellsJson: JSON.stringify(['cell_abort']),
      expiresAt: new Date(Date.now() + 3600000),
    });

    const res = await app.inject({
      method: 'POST',
      url: `/api/episodes/${episode._id}/threat-abort`,
      headers: { Authorization: `Bearer ${responderToken}` },
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json().success, true);
    assert.strictEqual(res.json().data.aborted, true);

    const updatedEp = await Episode.findById(episode._id);
    assert.strictEqual(updatedEp?.status, 'THREAT_ABORTED');

    const updatedDevice = await Device.findById(testDevice._id);
    assert.ok((updatedDevice?.suspiciousCount || 0) >= 1);
  });

  it('5. Bi-Directional Safety Rating & Automated Quarantining: Auto-quarantines account on 2+ suspicious flags', async () => {
    const episode = await Episode.create({
      requesterDeviceId: testDevice._id,
      category: 'medical',
      urgency: 5,
      status: 'active',
      latitude: 37.7749,
      longitude: -122.4194,
      location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      radiusMeters: 500,
      blindedGridSigs: 'sig_outcome',
      helperValidationKey: 'key_outcome',
      gridCellsJson: JSON.stringify(['cell_outcome']),
      expiresAt: new Date(Date.now() + 3600000),
    });

    const outcomeRes = await app.inject({
      method: 'POST',
      url: '/api/outcomes',
      headers: { Authorization: `Bearer ${responderToken}` },
      payload: {
        episodeId: episode._id.toString(),
        result: 'SUSPICIOUS_BEHAVIOR',
        category: 'medical',
        completedInWindow: true,
      },
    });

    assert.strictEqual(outcomeRes.statusCode, 201);

    const checkDevice = await Device.findById(testDevice._id);
    assert.strictEqual(checkDevice?.isQuarantined, true);
  });

  it('6. Quarantined Account Enforcement: Quarantined account is strictly blocked from creating new episodes', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/episodes',
      headers: { Authorization: `Bearer ${testToken}` },
      payload: {
        category: 'medical',
        urgency: 5,
        latitude: 37.7749,
        longitude: -122.4194,
        blindedGridSigs: 'sig',
        helperValidationKey: 'key',
        gridCellsJson: '[]',
      },
    });

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.json().success, false);
    assert.ok(res.json().error.message.includes('QUARANTINED_DEVICE'));
  });
});

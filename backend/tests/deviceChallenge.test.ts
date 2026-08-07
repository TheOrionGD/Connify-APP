import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app';
import { Device, DeviceChallenge } from '../src/models';
import nacl from 'tweetnacl';
import { connectDB } from '../src/utils/db';
import { initKeys } from '../src/services/KeyService';

describe('Device Challenge-Response Nonce Tests', () => {
  const app = buildApp();

  before(async () => {
    await connectDB();
    await initKeys();
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('1. Reusing a consumed challenge nonce -> fails on second attempt (single-use)', async () => {
    const keyPair = nacl.sign.keyPair();
    const publicKeyHex = Buffer.from(keyPair.publicKey).toString('hex');
    const fingerprint = 'a'.repeat(64);

    const device = await Device.create({
      deviceFingerprintHash: fingerprint,
      publicKey: publicKeyHex,
    });

    const challengeHex = '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff';

    await DeviceChallenge.create({
      challenge: challengeHex,
      deviceId: device._id,
    });

    const challengeBuffer = Buffer.from(challengeHex);
    const signatureBytes = nacl.sign.detached(challengeBuffer, keyPair.secretKey);
    const signatureHex = Buffer.from(signatureBytes).toString('hex');

    const { signToken } = await import('../src/services/KeyService');
    const token = await signToken({ sub: device._id.toString() });

    // 1st verify attempt -> should succeed & consume challenge
    const res1 = await app.inject({
      method: 'POST',
      url: '/api/devices/verify',
      headers: { Authorization: `Bearer ${token}` },
      payload: { challenge: challengeHex, signature: signatureHex },
    });
    assert.strictEqual(res1.statusCode, 200);
    assert.strictEqual(res1.json().data.verified, true);

    // 2nd verify attempt with same challenge -> should fail (nonce consumed)
    const res2 = await app.inject({
      method: 'POST',
      url: '/api/devices/verify',
      headers: { Authorization: `Bearer ${token}` },
      payload: { challenge: challengeHex, signature: signatureHex },
    });
    assert.strictEqual(res2.statusCode, 400);
    assert.strictEqual(res2.json().error.code, 'INVALID_OR_EXPIRED_CHALLENGE');

    // Cleanup
    await Device.deleteOne({ _id: device._id });
  });
});

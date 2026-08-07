import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import nacl from 'tweetnacl';
import { CapsuleController } from '../src/controllers/CapsuleController';
import { Device, Episode, Capsule } from '../src/models';
import { connectDB } from '../src/utils/db';
import { initKeys } from '../src/services/KeyService';

function generateTestKeyPair() {
  const pair = nacl.sign.keyPair();
  const publicKeyHex = Buffer.from(pair.publicKey).toString('hex');
  const secretKeyHex = Buffer.from(pair.secretKey).toString('hex');
  return { pair, publicKeyHex, secretKeyHex };
}

function encodeBase64Url(str: string) {
  return Buffer.from(str, 'utf-8').toString('base64url');
}

function createSignedQrToken(
  episodeId: string,
  secretKey: Uint8Array,
  options?: { nonce?: string; exp?: number; requesterDeviceId?: string }
) {
  const header = { alg: 'EdDSA', typ: 'JWT' };
  const nonce = options?.nonce ?? crypto.randomUUID();
  const payload = {
    episodeId,
    requesterDeviceId: options?.requesterDeviceId ?? 'dev-requester',
    nonce,
    exp: options?.exp ?? Math.floor(Date.now() / 1000) + 90,
  };

  const headerB64 = encodeBase64Url(JSON.stringify(header));
  const payloadB64 = encodeBase64Url(JSON.stringify(payload));
  const challenge = `${headerB64}.${payloadB64}`;

  const signatureBytes = nacl.sign.detached(Buffer.from(challenge, 'utf-8'), secretKey);
  const signatureHex = Buffer.from(signatureBytes).toString('hex');

  return {
    qrToken: `${headerB64}.${payloadB64}.${signatureHex}`,
    nonce,
    headerB64,
    payloadB64,
    signatureHex,
  };
}

function createTestReply() {
  let statusCode = 200;
  let sentData: any = null;
  const reply: any = {
    status(code: number) {
      statusCode = code;
      return reply;
    },
    send(data: any) {
      sentData = data;
      return reply;
    },
    get statusCode() {
      return statusCode;
    },
    get sentData() {
      return sentData;
    },
  };
  return reply;
}

describe('CapsuleController — QR Proximity & Nonce Security Tests', () => {
  let requesterKeyPair: ReturnType<typeof generateTestKeyPair>;
  let helperKeyPair: ReturnType<typeof generateTestKeyPair>;
  let requesterDevice: any;
  let helperDevice: any;

  before(async () => {
    await connectDB();
    await initKeys();

    requesterKeyPair = generateTestKeyPair();
    helperKeyPair = generateTestKeyPair();

    requesterDevice = await Device.create({
      deviceFingerprintHash: 'req-fp-' + Math.random().toString(36).substring(2),
      publicKey: requesterKeyPair.publicKeyHex,
    });

    helperDevice = await Device.create({
      deviceFingerprintHash: 'help-fp-' + Math.random().toString(36).substring(2),
      publicKey: helperKeyPair.publicKeyHex,
    });
  });

  after(async () => {
    if (requesterDevice) await Device.findByIdAndDelete(requesterDevice._id);
    if (helperDevice) await Device.findByIdAndDelete(helperDevice._id);
    await mongoose.disconnect();
  });

  it('1. Valid QR token + valid signature + fresh nonce -> capsule issued', async () => {
    const episode = await Episode.create({
      requesterDeviceId: requesterDevice._id,
      category: 'MEDICAL',
      urgency: 5,
      status: 'pending',
      latitude: 37.7749,
      longitude: -122.4194,
      location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      radiusMeters: 500,
      gridCellsJson: JSON.stringify(['cell_0_0']),
      usedQrNonces: [],
      expiresAt: new Date(Date.now() + 3600000),
    });

    const { qrToken } = createSignedQrToken(episode._id.toString(), requesterKeyPair.pair.secretKey);
    const reply = createTestReply();

    await CapsuleController.issue(
      {
        episodeId: episode._id.toString(),
        helperDeviceId: helperDevice._id.toString(),
        verificationData: {
          qrToken,
          blindedGridCell: 'cell_0_0',
        },
      },
      reply
    );

    assert.strictEqual(reply.statusCode, 201);
    assert.strictEqual(reply.sentData.success, true);
    assert.ok(reply.sentData.data.capsuleToken);
    assert.ok(reply.sentData.data.capsuleId);

    await Episode.findByIdAndDelete(episode._id);
    await Capsule.deleteMany({ episodeId: episode._id });
  });

  it('2. Expired token -> rejected', async () => {
    const episode = await Episode.create({
      requesterDeviceId: requesterDevice._id,
      category: 'MEDICAL',
      urgency: 5,
      status: 'pending',
      latitude: 37.7749,
      longitude: -122.4194,
      location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      radiusMeters: 500,
      usedQrNonces: [],
      expiresAt: new Date(Date.now() + 3600000),
    });

    const expiredExp = Math.floor(Date.now() / 1000) - 60;
    const { qrToken } = createSignedQrToken(episode._id.toString(), requesterKeyPair.pair.secretKey, { exp: expiredExp });
    const reply = createTestReply();

    await CapsuleController.issue(
      {
        episodeId: episode._id.toString(),
        helperDeviceId: helperDevice._id.toString(),
        verificationData: {
          qrToken,
          blindedGridCell: 'cell_0_0',
        },
      },
      reply
    );

    assert.strictEqual(reply.statusCode, 403);
    assert.strictEqual(reply.sentData.success, false);
    assert.strictEqual(reply.sentData.error.code, 'PROXIMITY_VERIFICATION_FAILED');

    await Episode.findByIdAndDelete(episode._id);
  });

  it('3. Tampered/invalid signature -> rejected', async () => {
    const episode = await Episode.create({
      requesterDeviceId: requesterDevice._id,
      category: 'MEDICAL',
      urgency: 5,
      status: 'pending',
      latitude: 37.7749,
      longitude: -122.4194,
      location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      radiusMeters: 500,
      usedQrNonces: [],
      expiresAt: new Date(Date.now() + 3600000),
    });

    const { headerB64, payloadB64 } = createSignedQrToken(episode._id.toString(), requesterKeyPair.pair.secretKey);
    const invalidSignatureHex = '00'.repeat(64);
    const tamperedQrToken = `${headerB64}.${payloadB64}.${invalidSignatureHex}`;

    const reply = createTestReply();

    await CapsuleController.issue(
      {
        episodeId: episode._id.toString(),
        helperDeviceId: helperDevice._id.toString(),
        verificationData: {
          qrToken: tamperedQrToken,
          blindedGridCell: 'cell_0_0',
        },
      },
      reply
    );

    assert.strictEqual(reply.statusCode, 403);
    assert.strictEqual(reply.sentData.success, false);
    assert.strictEqual(reply.sentData.error.code, 'PROXIMITY_VERIFICATION_FAILED');

    await Episode.findByIdAndDelete(episode._id);
  });

  it('4. Reused nonce (same token submitted twice) -> second attempt rejected', async () => {
    const episode = await Episode.create({
      requesterDeviceId: requesterDevice._id,
      category: 'MEDICAL',
      urgency: 5,
      status: 'pending',
      latitude: 37.7749,
      longitude: -122.4194,
      location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      radiusMeters: 500,
      usedQrNonces: [],
      expiresAt: new Date(Date.now() + 3600000),
    });

    const { qrToken } = createSignedQrToken(episode._id.toString(), requesterKeyPair.pair.secretKey);
    const reply1 = createTestReply();

    await CapsuleController.issue(
      {
        episodeId: episode._id.toString(),
        helperDeviceId: helperDevice._id.toString(),
        verificationData: {
          qrToken,
          blindedGridCell: 'cell_0_0',
        },
      },
      reply1
    );

    assert.strictEqual(reply1.statusCode, 201);
    assert.strictEqual(reply1.sentData.success, true);

    const reply2 = createTestReply();
    await CapsuleController.issue(
      {
        episodeId: episode._id.toString(),
        helperDeviceId: helperDevice._id.toString(),
        verificationData: {
          qrToken,
          blindedGridCell: 'cell_0_0',
        },
      },
      reply2
    );

    assert.strictEqual(reply2.statusCode, 403);
    assert.strictEqual(reply2.sentData.success, false);

    await Episode.findByIdAndDelete(episode._id);
    await Capsule.deleteMany({ episodeId: episode._id });
  });

  it('5. Two concurrent requests with the same nonce -> exactly one succeeds, one rejected', async () => {
    const episode = await Episode.create({
      requesterDeviceId: requesterDevice._id,
      category: 'MEDICAL',
      urgency: 5,
      status: 'pending',
      latitude: 37.7749,
      longitude: -122.4194,
      location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      radiusMeters: 500,
      usedQrNonces: [],
      expiresAt: new Date(Date.now() + 3600000),
    });

    const { qrToken, nonce } = createSignedQrToken(episode._id.toString(), requesterKeyPair.pair.secretKey);

    const reply1 = createTestReply();
    const reply2 = createTestReply();

    const input = {
      episodeId: episode._id.toString(),
      helperDeviceId: helperDevice._id.toString(),
      verificationData: {
        qrToken,
        blindedGridCell: 'cell_0_0',
      },
    };

    await Promise.all([
      CapsuleController.issue(input, reply1),
      CapsuleController.issue(input, reply2),
    ]);

    const statusCodes = [reply1.statusCode, reply2.statusCode].sort();
    assert.deepStrictEqual(statusCodes, [201, 403]);

    const updatedEpisode = await Episode.findById(episode._id);
    const nonceCount = updatedEpisode?.usedQrNonces.filter((n: string) => n === nonce).length;
    assert.strictEqual(nonceCount, 1);

    await Episode.findByIdAndDelete(episode._id);
    await Capsule.deleteMany({ episodeId: episode._id });
  });
});

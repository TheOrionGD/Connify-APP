import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import nacl from 'tweetnacl';
import { buildApp } from '../src/app';
import { Device, Episode, Capsule, Outcome, Profile, DeviceChallenge } from '../src/models';
import { connectDB } from '../src/utils/db';
import { initKeys, signToken } from '../src/services/KeyService';

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
  const nonce = options?.nonce ?? (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Math.random().toString(36).substring(2));
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

describe('All Backend Endpoints Integration Test Suite', () => {
  const app = buildApp();
  let testDevice: any;
  let testHelperDevice: any;
  let authToken: string;
  let requesterKeyPair: ReturnType<typeof generateTestKeyPair>;
  let helperKeyPair: ReturnType<typeof generateTestKeyPair>;
  let createdEpisodeId: string;
  let issuedCapsuleToken: string;
  let devOtpCode: string;

  before(async () => {
    await connectDB();
    await initKeys();
    await app.ready();

    requesterKeyPair = generateTestKeyPair();
    helperKeyPair = generateTestKeyPair();

    testDevice = await Device.create({
      deviceFingerprintHash: 'all-ep-req-' + Math.random().toString(36).substring(2).padEnd(50, '0'),
      publicKey: requesterKeyPair.publicKeyHex,
    });

    testHelperDevice = await Device.create({
      deviceFingerprintHash: 'all-ep-hlp-' + Math.random().toString(36).substring(2).padEnd(50, '0'),
      publicKey: helperKeyPair.publicKeyHex,
    });

    authToken = await signToken({ sub: testDevice._id.toString() });
  });

  after(async () => {
    if (testDevice) await Device.findByIdAndDelete(testDevice._id);
    if (testHelperDevice) await Device.findByIdAndDelete(testHelperDevice._id);
    if (createdEpisodeId) {
      await Episode.findByIdAndDelete(createdEpisodeId);
      await Capsule.deleteMany({ episodeId: createdEpisodeId });
      await Outcome.deleteMany({ episodeId: createdEpisodeId });
    }
    if (testDevice) await Profile.deleteMany({ deviceId: testDevice._id });
    await app.close();
    await mongoose.disconnect();
  });

  // -------------------------------------------------------------
  // 1. Root & Health Endpoints
  // -------------------------------------------------------------
  describe('1. Root & Health Routes', () => {
    it('GET / -> Returns welcome status', async () => {
      const res = await app.inject({ method: 'GET', url: '/' });
      assert.strictEqual(res.statusCode, 200);
      const json = res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.message.includes('Connify'));
    });

    it('GET /favicon.ico -> Returns 204 No Content', async () => {
      const res = await app.inject({ method: 'GET', url: '/favicon.ico' });
      assert.strictEqual(res.statusCode, 204);
    });

    it('GET /health -> Returns system health status', async () => {
      const res = await app.inject({ method: 'GET', url: '/health' });
      assert.strictEqual(res.statusCode, 200);
      const json = res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.services.database, 'connected');
    });
  });

  // -------------------------------------------------------------
  // 2. Auth Endpoints (/api/auth)
  // -------------------------------------------------------------
  describe('2. Auth Routes (/api/auth)', () => {
    it('POST /api/auth/send-email-otp -> Rejects invalid email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/send-email-otp',
        payload: { email: 'invalid-email' },
      });
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.json().error.code, 'INVALID_EMAIL');
    });

    it('POST /api/auth/send-email-otp -> Generates and dispatches OTP', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/send-email-otp',
        payload: { email: 'test.endpoint@example.com' },
      });
      assert.strictEqual(res.statusCode, 200);
      const json = res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.devOtp);
      devOtpCode = json.devOtp;
    });

    it('POST /api/auth/verify-email-otp -> Rejects missing fields', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-email-otp',
        payload: { email: 'test.endpoint@example.com' },
      });
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.json().error.code, 'MISSING_FIELDS');
    });

    it('POST /api/auth/verify-email-otp -> Rejects invalid OTP', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-email-otp',
        payload: { email: 'test.endpoint@example.com', otp: '0000000' },
      });
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.json().error.code, 'INVALID_OTP');
    });

    it('POST /api/auth/verify-email-otp -> Verifies valid OTP', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-email-otp',
        payload: { email: 'test.endpoint@example.com', otp: devOtpCode },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
    });
  });

  // -------------------------------------------------------------
  // 3. Device Endpoints (/api/devices)
  // -------------------------------------------------------------
  describe('3. Device Routes (/api/devices)', () => {
    it('POST /api/devices/register -> Rejects without Firebase auth', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/devices/register',
        payload: {
          deviceFingerprintHash: 'c'.repeat(64),
          publicKey: 'test-key',
        },
      });
      assert.strictEqual(res.statusCode, 401);
    });

    it('POST /api/devices/challenge -> Rejects unauthenticated request', async () => {
      const res = await app.inject({ method: 'POST', url: '/api/devices/challenge' });
      assert.strictEqual(res.statusCode, 401);
    });

    it('POST /api/devices/challenge -> Issues single-use challenge nonce when authenticated', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/devices/challenge',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 201);
      const json = res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.data.challenge);
    });

    it('POST /api/devices/verify -> Verifies device challenge response', async () => {
      const challengeHex = 'a'.repeat(64);
      await DeviceChallenge.create({
        challenge: challengeHex,
        deviceId: testDevice._id,
      });

      const challengeBuffer = Buffer.from(challengeHex);
      const signatureBytes = nacl.sign.detached(challengeBuffer, requesterKeyPair.pair.secretKey);
      const signatureHex = Buffer.from(signatureBytes).toString('hex');

      const res = await app.inject({
        method: 'POST',
        url: '/api/devices/verify',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {
          challenge: challengeHex,
          signature: signatureHex,
        },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().data.verified, true);
    });
  });

  // -------------------------------------------------------------
  // 4. Profile Endpoints (/api/profile)
  // -------------------------------------------------------------
  describe('4. Profile Routes (/api/profile)', () => {
    it('GET /api/profile -> Rejects unauthenticated request', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/profile' });
      assert.strictEqual(res.statusCode, 401);
    });

    it('POST /api/profile -> Creates/updates profile for authenticated device', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/profile',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          medicalNotes: 'No allergies',
        },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
    });

    it('GET /api/profile -> Retrieves profile for authenticated device', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/profile',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      const json = res.json();
      assert.strictEqual(json.data.firstName, 'John');
      assert.strictEqual(json.data.lastName, 'Doe');
    });
  });

  // -------------------------------------------------------------
  // 5. Episode Endpoints (/api/episodes)
  // -------------------------------------------------------------
  describe('5. Episode Routes (/api/episodes)', () => {
    it('GET /api/episodes/nearby -> Rejects invalid location (0,0)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/episodes/nearby?latitude=0&longitude=0',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 400);
    });

    it('POST /api/episodes -> Creates new emergency episode', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/episodes',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {
          category: 'medical',
          urgency: 4,
          context: 'Test medical emergency episode',
          latitude: 37.7749,
          longitude: -122.4194,
          radiusMeters: 500,
          blindedGridSigs: 'test-blinded-sig',
          helperValidationKey: 'test-helper-val-key',
          gridCellsJson: JSON.stringify(['cell_37_-122']),
        },
      });
      assert.strictEqual(res.statusCode, 201);
      const json = res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.data.id);
      createdEpisodeId = json.data.id;
    });

    it('GET /api/episodes/nearby -> Queries nearby active episodes', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/episodes/nearby?latitude=37.7749&longitude=-122.4194&radiusMeters=1000',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
      assert.ok(Array.isArray(res.json().data));
    });

    it('GET /api/episodes/:id -> Fetches episode by ID', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/episodes/${createdEpisodeId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().data.id, createdEpisodeId);
    });

    it('PATCH /api/episodes/:id/cancel -> Cancels an active episode', async () => {
      // Create a temporary episode to cancel
      const epRes = await app.inject({
        method: 'POST',
        url: '/api/episodes',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {
          category: 'transport',
          urgency: 2,
          latitude: 37.7749,
          longitude: -122.4194,
          radiusMeters: 500,
          blindedGridSigs: 'temp-sig',
          helperValidationKey: 'temp-key',
          gridCellsJson: JSON.stringify(['cell_0_0']),
        },
      });
      const tempId = epRes.json().data.id;

      const cancelRes = await app.inject({
        method: 'PATCH',
        url: `/api/episodes/${tempId}/cancel`,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(cancelRes.statusCode, 200);
      assert.strictEqual(cancelRes.json().data.status, 'cancelled');
    });
  });

  // -------------------------------------------------------------
  // 6. Capsule Endpoints (/api/capsules)
  // -------------------------------------------------------------
  describe('6. Capsule Routes (/api/capsules)', () => {
    it('POST /api/capsules/issue -> Issues a Trust Capsule', async () => {
      const { qrToken } = createSignedQrToken(createdEpisodeId, requesterKeyPair.pair.secretKey);
      const res = await app.inject({
        method: 'POST',
        url: '/api/capsules/issue',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {
          episodeId: createdEpisodeId,
          helperDeviceId: testHelperDevice._id.toString(),
          verificationData: {
            qrToken,
            blindedGridCell: 'cell_37_-122',
          },
        },
      });
      assert.strictEqual(res.statusCode, 201);
      const json = res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.data.capsuleToken);
      assert.ok(json.data.capsuleId);
      issuedCapsuleToken = json.data.capsuleToken;
    });

    it('POST /api/capsules/redeem -> Redeems a Trust Capsule', async () => {
      const helperToken = await signToken({ sub: testHelperDevice._id.toString() });
      const res = await app.inject({
        method: 'POST',
        url: '/api/capsules/redeem',
        headers: { Authorization: `Bearer ${helperToken}` },
        payload: { capsuleToken: issuedCapsuleToken },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
    });

    it('POST /api/capsules/:id/revoke -> Revokes an active capsule', async () => {
      const revCapsule = await Capsule.create({
        episodeId: createdEpisodeId,
        helperDeviceId: testHelperDevice._id,
        signedTokenHash: 'revoke-test-hash-' + Math.random(),
        status: 'issued',
        expiresAt: new Date(Date.now() + 3600000),
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/capsules/${revCapsule._id.toString()}/revoke`,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().data.status, 'revoked');
    });

    it('POST /api/capsules/verify-qr -> Handshake endpoint test', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/capsules/verify-qr',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {},
      });
      assert.ok([200, 400, 403].includes(res.statusCode));
    });
  });

  // -------------------------------------------------------------
  // 7. Outcome Endpoints (/api/outcomes)
  // -------------------------------------------------------------
  describe('7. Outcome Routes (/api/outcomes)', () => {
    it('POST /api/outcomes -> Logs a completed episode outcome record', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/outcomes',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {
          episodeId: createdEpisodeId,
          result: 'success',
          category: 'medical',
          riskLevel: 2,
          completedInWindow: true,
        },
      });
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.json().success, true);
    });
  });

  // -------------------------------------------------------------
  // 8. Admin Endpoints (/api/admin)
  // -------------------------------------------------------------
  describe('8. Admin Routes (/api/admin)', () => {
    it('GET /api/admin/guardians -> Returns paginated devices', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/guardians',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
    });

    it('GET /api/admin/sos-alerts -> Returns paginated SOS alerts', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/sos-alerts',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
    });

    it('GET /api/admin/jit-credentials -> Returns paginated JIT credentials', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/jit-credentials',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
    });

    it('GET /api/admin/audit-ledgers -> Returns paginated audit ledgers', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/audit-ledgers',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
    });

    it('GET /api/admin/dashboard -> Returns admin dashboard metrics', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/dashboard',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
      assert.ok(typeof res.json().data.totalEpisodes === 'number');
    });

    it('GET /api/admin/audit-chain -> Returns audit chain verification result', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/audit-chain',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
    });

    it('GET /api/admin/devices -> Returns list of devices', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/devices',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
    });

    it('GET /api/admin/capsules -> Returns list of capsules', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/capsules',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
    });

    it('GET /api/admin/outcomes -> Returns list of outcomes', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/outcomes',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
    });

    it('GET /api/admin/episodes -> Returns list of episodes', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/episodes',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
    });

    it('POST /api/admin/simulate/episode -> Simulates creating an episode', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/simulate/episode',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { category: 'emergency', urgency: 5 },
      });
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.json().success, true);
    });

    it('POST /api/admin/simulate/checkin -> Simulates checking in an active episode', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/simulate/checkin',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {},
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
    });

    it('POST /api/admin/simulate/corrupt -> Simulates audit log corruption', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/simulate/corrupt',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
    });

    it('POST /api/admin/simulate/reset -> Repairs/heals audit log chain', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/simulate/reset',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json().success, true);
      assert.ok(typeof res.json().data.healedCount === 'number');
    });
  });
});

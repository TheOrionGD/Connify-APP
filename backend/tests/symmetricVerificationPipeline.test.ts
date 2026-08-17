import mongoose from 'mongoose';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app';
import { Device, DeviceChallenge, Episode, Capsule } from '../src/models';
import nacl from 'tweetnacl';
import { connectDB } from '../src/utils/db';
import { initKeys, signToken } from '../src/services/KeyService';

describe('Symmetric Zero-Fallback Verification Pipeline Test Suite', () => {
  const app = buildApp();

  let senderDevice: any;
  let senderKeyPair: nacl.SignKeyPair;
  let senderToken: string;

  let acceptorDevice: any;
  let acceptorKeyPair: nacl.SignKeyPair;
  let acceptorToken: string;

  let createdEpisodeId: string;

  before(async () => {
    await connectDB();
    await initKeys();
    await app.ready();

    // Setup Sender Device
    senderKeyPair = nacl.sign.keyPair();
    const senderPubKeyHex = Buffer.from(senderKeyPair.publicKey).toString('hex');
    senderDevice = await Device.create({
      deviceFingerprintHash: 'f'.repeat(64),
      publicKey: senderPubKeyHex,
    });
    senderToken = await signToken({ sub: senderDevice._id.toString() });

    await mongoose.model('Guardian').create({
      deviceId: senderDevice._id,
      userFullName: 'Sender User',
      fullName: 'Sender Guardian',
      phone: '+1234567890',
      relationship: 'Friend'
    });

    // Setup Acceptor Device
    acceptorKeyPair = nacl.sign.keyPair();
    const acceptorPubKeyHex = Buffer.from(acceptorKeyPair.publicKey).toString('hex');
    acceptorDevice = await Device.create({
      deviceFingerprintHash: 'e'.repeat(64),
      publicKey: acceptorPubKeyHex,
    });
    acceptorToken = await signToken({ sub: acceptorDevice._id.toString() });
  });

  after(async () => {
    if (createdEpisodeId) {
      await Episode.findByIdAndDelete(createdEpisodeId);
      await Capsule.deleteMany({ episodeId: createdEpisodeId });
    }
    if (senderDevice) {
      await Device.findByIdAndDelete(senderDevice._id);
    }
    if (acceptorDevice) {
      await Device.findByIdAndDelete(acceptorDevice._id);
    }
    await app.close();
    await mongoose.disconnect();
  });

  // -------------------------------------------------------------------------
  // POSITIVE CONSTRAINTS
  // -------------------------------------------------------------------------
  describe('1. POSITIVE CONSTRAINTS', () => {
    it('1.1. Sender Handshake: Issues and verifies live 60s challenge nonce with valid Ed25519 signature', async () => {
      // 1. Fetch challenge nonce
      const chalRes = await app.inject({
        method: 'POST',
        url: '/api/devices/challenge',
        headers: { Authorization: `Bearer ${senderToken}` },
      });
      assert.strictEqual(chalRes.statusCode, 201);
      const challengeHex = chalRes.json().data.challenge;
      assert.ok(challengeHex);

      // 2. Sign challenge buffer with Sender's secret key
      const challengeBuffer = Buffer.from(challengeHex);
      const signatureBytes = nacl.sign.detached(challengeBuffer, senderKeyPair.secretKey);
      const signatureHex = Buffer.from(signatureBytes).toString('hex');

      // 3. Submit signature for verification
      const verifyRes = await app.inject({
        method: 'POST',
        url: '/api/devices/verify',
        headers: { Authorization: `Bearer ${senderToken}` },
        payload: { challenge: challengeHex, signature: signatureHex },
      });
      assert.strictEqual(verifyRes.statusCode, 200);
      assert.strictEqual(verifyRes.json().data.verified, true);
    });

    it('1.2. Sender Emergency Trigger: Creates emergency episode with valid parameters & challenge metadata', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/episodes',
        headers: { Authorization: `Bearer ${senderToken}` },
        payload: {
          category: 'medical',
          urgency: 4,
          context: 'Test medical emergency trigger',
          latitude: 37.7749,
          longitude: -122.4194,
          radiusMeters: 500,
          blindedGridSigs: '0x_blinded_sig_sender_alpha',
          helperValidationKey: '0x_val_key_sender_alpha',
          gridCellsJson: JSON.stringify(['cell_1', 'cell_2']),
          isDuress: false,
        },
      });

      assert.strictEqual(res.statusCode, 201);
      const json = res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.data.id);
      createdEpisodeId = json.data.id;
    });

    it('1.3. Sender Silent Duress Signal: Accepts isDuress flag for silent priority alerts', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/episodes',
        headers: { Authorization: `Bearer ${senderToken}` },
        payload: {
          category: 'general',
          urgency: 5,
          context: 'Silent duress trigger test',
          latitude: 37.7750,
          longitude: -122.4195,
          radiusMeters: 500,
          blindedGridSigs: '0x_blinded_sig_duress',
          helperValidationKey: '0x_val_key_duress',
          gridCellsJson: JSON.stringify(['cell_1']),
          isDuress: true,
        },
      });

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.json().success, true);
      
      // Cleanup extra duress episode
      if (res.json().data?.id) {
        await Episode.findByIdAndDelete(res.json().data.id);
      }
    });

    it('1.4. Acceptor Handshake & Capsule Issuance: Verifies responder biometrics/nonce and issues JIT Trust Capsule', async () => {
      // 1. Acceptor fetches challenge
      const chalRes = await app.inject({
        method: 'POST',
        url: '/api/devices/challenge',
        headers: { Authorization: `Bearer ${acceptorToken}` },
      });
      assert.strictEqual(chalRes.statusCode, 201);
      const challengeHex = chalRes.json().data.challenge;

      // 2. Acceptor signs challenge
      const challengeBuffer = Buffer.from(challengeHex);
      const signatureBytes = nacl.sign.detached(challengeBuffer, acceptorKeyPair.secretKey);
      const signatureHex = Buffer.from(signatureBytes).toString('hex');

      // 3. Verify Acceptor challenge
      const verifyRes = await app.inject({
        method: 'POST',
        url: '/api/devices/verify',
        headers: { Authorization: `Bearer ${acceptorToken}` },
        payload: { challenge: challengeHex, signature: signatureHex },
      });
      assert.strictEqual(verifyRes.statusCode, 200);

      // Create signed QR Token signed with Sender's Ed25519 Secret Key
      const headerB64 = Buffer.from(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' })).toString('base64url');
      const payloadB64 = Buffer.from(JSON.stringify({
        episodeId: createdEpisodeId,
        requesterDeviceId: senderDevice._id.toString(),
        nonce: 'test_nonce_' + Date.now(),
        exp: Math.floor(Date.now() / 1000) + 90,
      })).toString('base64url');

      const qrChallenge = `${headerB64}.${payloadB64}`;
      const qrSigBytes = nacl.sign.detached(Buffer.from(qrChallenge, 'utf-8'), senderKeyPair.secretKey);
      const qrSigHex = Buffer.from(qrSigBytes).toString('hex');
      const qrToken = `${headerB64}.${payloadB64}.${qrSigHex}`;

      // 4. Issue Trust Capsule linking Acceptor to Sender's Episode
      const capsuleRes = await app.inject({
        method: 'POST',
        url: '/api/capsules/issue',
        headers: { Authorization: `Bearer ${senderToken}` },
        payload: {
          episodeId: createdEpisodeId,
          helperDeviceId: acceptorDevice._id.toString(),
          verificationData: {
            qrToken,
            blindedGridCell: 'cell_1',
          },
        },
      });

      assert.strictEqual(capsuleRes.statusCode, 201);
      assert.strictEqual(capsuleRes.json().success, true);
      assert.ok(capsuleRes.json().data.capsuleToken);
    });
  });

  // -------------------------------------------------------------------------
  // NEGATIVE CONSTRAINTS (Zero-Fallback Enforcements)
  // -------------------------------------------------------------------------
  describe('2. NEGATIVE CONSTRAINTS (Zero-Fallback Safety Policies)', () => {
    it('2.1. REJECTS Invalid/Tampered Signature: Fails verification when signature is forged', async () => {
      const chalRes = await app.inject({
        method: 'POST',
        url: '/api/devices/challenge',
        headers: { Authorization: `Bearer ${senderToken}` },
      });
      const challengeHex = chalRes.json().data.challenge;

      // Generate signature using a DIFFERENT wrong keypair
      const wrongKeyPair = nacl.sign.keyPair();
      const challengeBuffer = Buffer.from(challengeHex);
      const invalidSignatureBytes = nacl.sign.detached(challengeBuffer, wrongKeyPair.secretKey);
      const invalidSignatureHex = Buffer.from(invalidSignatureBytes).toString('hex');

      const verifyRes = await app.inject({
        method: 'POST',
        url: '/api/devices/verify',
        headers: { Authorization: `Bearer ${senderToken}` },
        payload: { challenge: challengeHex, signature: invalidSignatureHex },
      });

      assert.strictEqual(verifyRes.statusCode, 400);
      assert.strictEqual(verifyRes.json().success, false);
      assert.strictEqual(verifyRes.json().error.code, 'SIGNATURE_VERIFICATION_FAILED');
    });

    it('2.2. REJECTS Reused Challenge Nonce: Fails on second verification attempt (single-use replay defense)', async () => {
      const chalRes = await app.inject({
        method: 'POST',
        url: '/api/devices/challenge',
        headers: { Authorization: `Bearer ${senderToken}` },
      });
      const challengeHex = chalRes.json().data.challenge;

      const challengeBuffer = Buffer.from(challengeHex);
      const signatureBytes = nacl.sign.detached(challengeBuffer, senderKeyPair.secretKey);
      const signatureHex = Buffer.from(signatureBytes).toString('hex');

      // 1st Attempt -> Succeeds
      const res1 = await app.inject({
        method: 'POST',
        url: '/api/devices/verify',
        headers: { Authorization: `Bearer ${senderToken}` },
        payload: { challenge: challengeHex, signature: signatureHex },
      });
      assert.strictEqual(res1.statusCode, 200);

      // 2nd Attempt -> REJECTED (Nonce consumed)
      const res2 = await app.inject({
        method: 'POST',
        url: '/api/devices/verify',
        headers: { Authorization: `Bearer ${senderToken}` },
        payload: { challenge: challengeHex, signature: signatureHex },
      });
      assert.strictEqual(res2.statusCode, 400);
      assert.strictEqual(res2.json().error.code, 'INVALID_OR_EXPIRED_CHALLENGE');
    });

    it('2.3. REJECTS Expired Challenge Nonce: Fails when challenge TTL exceeds 60s window', async () => {
      const expiredChallengeHex = 'b'.repeat(64);
      await DeviceChallenge.create({
        challenge: expiredChallengeHex,
        deviceId: senderDevice._id,
        createdAt: new Date(Date.now() - 70 * 1000), // 70 seconds ago (Expired)
      });

      const challengeBuffer = Buffer.from(expiredChallengeHex);
      const signatureBytes = nacl.sign.detached(challengeBuffer, senderKeyPair.secretKey);
      const signatureHex = Buffer.from(signatureBytes).toString('hex');

      const res = await app.inject({
        method: 'POST',
        url: '/api/devices/verify',
        headers: { Authorization: `Bearer ${senderToken}` },
        payload: { challenge: expiredChallengeHex, signature: signatureHex },
      });

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.json().error.code, 'INVALID_OR_EXPIRED_CHALLENGE');
    });

    it('2.4. REJECTS Unauthenticated Verification: Fails without Bearer JWT token', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/devices/challenge',
      });
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.json().success, false);
    });

    it('2.5. REJECTS Invalid Emergency Location (0,0): Fails payload validation', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/episodes',
        headers: { Authorization: `Bearer ${senderToken}` },
        payload: {
          category: 'medical',
          urgency: 3,
          latitude: 0,
          longitude: 0,
          blindedGridSigs: 'sig',
          helperValidationKey: 'key',
          gridCellsJson: '[]',
        },
      });

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.json().success, false);
      assert.strictEqual(res.json().error.code, 'VALIDATION_ERROR');
    });

    it('2.6. REJECTS Out-of-Bounds Urgency Level (> 5): Fails schema validation', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/episodes',
        headers: { Authorization: `Bearer ${senderToken}` },
        payload: {
          category: 'medical',
          urgency: 10, // Invalid urgency > 5
          latitude: 37.7749,
          longitude: -122.4194,
          blindedGridSigs: 'sig',
          helperValidationKey: 'key',
          gridCellsJson: '[]',
        },
      });

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.json().success, false);
    });
  });
});

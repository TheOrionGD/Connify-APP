import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import nacl from 'tweetnacl';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { buildApp } from '../src/app';
import { Device, Episode, Capsule, Outcome, Profile, Guardian, DeviceLocation } from '../src/models';
import { connectDB } from '../src/utils/db';
import { initKeys, signToken } from '../src/services/KeyService';
import { initSockets } from '../src/sockets';
import { LocationWatchdogService } from '../src/services/LocationWatchdogService';

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
  };
}

// Removed invalid static assignment of SIGNAL_LOSS_TIMEOUT_MS

describe('Full End-to-End User Journey Simulation', () => {
  const app = buildApp();
  let serverPort: number;

  // Requester State
  let reqDevice: any;
  let reqKeyPair: ReturnType<typeof generateTestKeyPair>;
  let reqToken: string;
  let reqSocket: ClientSocket;

  // Helper State
  let helperDevice: any;
  let helperKeyPair: ReturnType<typeof generateTestKeyPair>;
  let helperToken: string;
  let helperSocket: ClientSocket;

  // Emergency State
  let activeEpisodeId: string;
  let activeCapsuleToken: string;

  before(async () => {
    // 1. Boot up DB & Keys
    await connectDB();
    await initKeys();
    
    // 2. Start App & Sockets on random port
    await app.ready();
    await initSockets(app.server);
    await app.listen({ port: 0 });
    const address = app.server.address() as any;
    serverPort = address.port;

    // 3. Generate Crypto Keys
    reqKeyPair = generateTestKeyPair();
    helperKeyPair = generateTestKeyPair();
  });

  after(async () => {
    // Disconnect sockets
    if (reqSocket?.connected) reqSocket.disconnect();
    if (helperSocket?.connected) helperSocket.disconnect();

    // Clean up DB records
    if (reqDevice) {
      await Device.findByIdAndDelete(reqDevice._id);
      await Profile.deleteMany({ deviceId: reqDevice._id });
      await Guardian.deleteMany({ deviceId: reqDevice._id });
      await DeviceLocation.deleteMany({ deviceId: reqDevice._id });
    }
    if (helperDevice) {
      await Device.findByIdAndDelete(helperDevice._id);
      await Profile.deleteMany({ deviceId: helperDevice._id });
    }
    if (activeEpisodeId) {
      await Episode.findByIdAndDelete(activeEpisodeId);
      await Capsule.deleteMany({ episodeId: activeEpisodeId });
      await Outcome.deleteMany({ episodeId: activeEpisodeId });
    }

    // Shut down
    await app.close();
    await mongoose.disconnect();
  });

  it('Phase 1: Devices complete Registration', async () => {
    // Fake device creation (Registration is usually handled by Firebase Auth, we simulate it directly in DB for test speed)
    reqDevice = await Device.create({
      deviceFingerprintHash: 'e2e-req-' + Math.random().toString(36).substring(2),
      publicKey: reqKeyPair.publicKeyHex,
    });
    
    helperDevice = await Device.create({
      deviceFingerprintHash: 'e2e-hlp-' + Math.random().toString(36).substring(2),
      publicKey: helperKeyPair.publicKeyHex,
    });

    // Generate JWTs
    reqToken = await signToken({ sub: reqDevice._id.toString() });
    helperToken = await signToken({ sub: helperDevice._id.toString() });

    assert.ok(reqToken);
    assert.ok(helperToken);
  });

  it('Phase 2: Users construct Profiles and add Guardians', async () => {
    // Requester creates profile
    const profRes = await app.inject({
      method: 'POST',
      url: '/api/profile',
      headers: { Authorization: `Bearer ${reqToken}` },
      payload: { firstName: 'Alice', lastName: 'Requester', phone: '+123456789' },
    });
    assert.strictEqual(profRes.statusCode, 200);

    // Requester adds a Guardian directly to DB (Guardian endpoint omitted for brevity)
    await Guardian.create({
      deviceId: reqDevice._id,
      userFullName: 'Alice Requester',
      fullName: 'Alice Mom',
      phone: '+198765432',
      email: 'mom@example.com',
      relationship: 'Mother',
    });

    // Helper creates profile
    const helpProfRes = await app.inject({
      method: 'POST',
      url: '/api/profile',
      headers: { Authorization: `Bearer ${helperToken}` },
      payload: { firstName: 'Bob', lastName: 'Helper', phone: '+100000000' },
    });
    assert.strictEqual(helpProfRes.statusCode, 200);
  });

  it('Phase 3: Requester opens App and Socket connects (Location Watchdog Tracking Begins)', async () => {
    reqSocket = Client(`http://localhost:${serverPort}`, {
      auth: { token: reqToken },
    });

    await new Promise<void>((resolve, reject) => {
      reqSocket.on('connect', resolve);
      reqSocket.on('connect_error', reject);
    });
    assert.strictEqual(reqSocket.connected, true);

    // Stream a location ping
    await new Promise<void>((resolve, reject) => {
      reqSocket.emit('location_ping', { latitude: 37.77, longitude: -122.41 }, (res: any) => {
        if (res.success) resolve();
        else reject(res.error);
      });
    });

    const loc = await DeviceLocation.findOne({ deviceId: reqDevice._id });
    assert.strictEqual(loc?.latitude, 37.77);
  });

  it('Phase 4: Requester Triggers an Emergency Episode', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/episodes',
      headers: { Authorization: `Bearer ${reqToken}` },
      payload: {
        category: 'medical',
        urgency: 5,
        latitude: 37.77,
        longitude: -122.41,
        radiusMeters: 500,
        blindedGridSigs: 'dummy-sig',
        helperValidationKey: 'dummy-key',
        gridCellsJson: JSON.stringify(['cell_37_-122']),
      },
    });
    assert.strictEqual(res.statusCode, 201);
    activeEpisodeId = res.json().data.id;
    assert.ok(activeEpisodeId);
  });

  it('Phase 5: Helper discovers the Episode and receives a Trust Capsule', async () => {
    // 1. Discover
    const nearbyRes = await app.inject({
      method: 'GET',
      url: '/api/episodes/nearby?latitude=37.77&longitude=-122.41',
      headers: { Authorization: `Bearer ${helperToken}` },
    });
    assert.strictEqual(nearbyRes.statusCode, 200);
    const episodes = nearbyRes.json().data;
    assert.ok(episodes.find((e: any) => e.id === activeEpisodeId));

    // 2. Issue Capsule
    const { qrToken } = createSignedQrToken(activeEpisodeId, reqKeyPair.pair.secretKey);
    const issueRes = await app.inject({
      method: 'POST',
      url: '/api/capsules/issue',
      headers: { Authorization: `Bearer ${reqToken}` },
      payload: {
        episodeId: activeEpisodeId,
        helperDeviceId: helperDevice._id.toString(),
        verificationData: { qrToken, blindedGridCell: 'cell_37_-122' },
      },
    });
    assert.strictEqual(issueRes.statusCode, 201);
    activeCapsuleToken = issueRes.json().data.capsuleToken;
    assert.ok(activeCapsuleToken);
  });

  it('Phase 6: Both devices join ephemeral WebSocket Channel and Chat', async () => {
    helperSocket = Client(`http://localhost:${serverPort}`, {
      auth: { token: helperToken },
    });
    await new Promise<void>((resolve) => { helperSocket.on('connect', resolve); });

    // Join Rooms
    await Promise.all([
      new Promise<void>((resolve) => reqSocket.emit('join_episode', { episodeId: activeEpisodeId }, (res: any) => resolve())),
      new Promise<void>((resolve) => helperSocket.emit('join_episode', { episodeId: activeEpisodeId }, (res: any) => resolve())),
    ]);

    // Send Message
    const messagePromise = new Promise<void>((resolve) => {
      reqSocket.on('new_message', (data) => {
        if (data.message === 'I am on my way!') resolve();
      });
    });

    helperSocket.emit('send_message', { episodeId: activeEpisodeId, message: 'I am on my way!' });
    await messagePromise;
  });

  it('Phase 7: Helper arrives and redeems Capsule (Cryptographic Handshake)', async () => {
    const redeemRes = await app.inject({
      method: 'POST',
      url: '/api/capsules/redeem',
      headers: { Authorization: `Bearer ${helperToken}` },
      payload: { capsuleToken: activeCapsuleToken },
    });
    assert.strictEqual(redeemRes.statusCode, 200);
    assert.strictEqual(redeemRes.json().success, true);
  });

  it('Phase 8: Requester submits final positive Outcome', async () => {
    const outcomeRes = await app.inject({
      method: 'POST',
      url: '/api/outcomes',
      headers: { Authorization: `Bearer ${reqToken}` },
      payload: {
        episodeId: activeEpisodeId,
        result: 'success',
        category: 'medical',
        riskLevel: 1,
        completedInWindow: true,
      },
    });
    assert.strictEqual(outcomeRes.statusCode, 201);
  });

  it('Phase 9: Requester enters dead zone, Watchdog detects Signal Loss', async () => {
    // Disconnect the socket to simulate signal loss
    reqSocket.disconnect();
    
    // Artificially age the last ping so watchdog flags it
    const loc = await DeviceLocation.findOne({ deviceId: reqDevice._id });
    if (loc) {
      loc.lastPingAt = new Date(Date.now() - 30000); // 30 seconds ago
      await loc.save();
    }

    // Run the scanner manually
    await LocationWatchdogService.checkSignalLossAndNotifyGuardians();

    // Verify it was marked as signal lost
    const updatedLoc = await DeviceLocation.findOne({ deviceId: reqDevice._id });
    assert.strictEqual(updatedLoc?.signalLostAlertSent, true);
  });

  // ==========================================
  // NEGATIVE TESTS (Handling False/Incorrect Data)
  // ==========================================

  it('Phase 10 (Negative): Reject Episode creation with invalid coordinates (out of bounds)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/episodes',
      headers: { Authorization: `Bearer ${reqToken}` },
      payload: {
        category: 'medical',
        urgency: 5,
        latitude: 999, // Invalid latitude (>90)
        longitude: -122.41,
        radiusMeters: 500,
        blindedGridSigs: 'dummy-sig',
        helperValidationKey: 'dummy-key',
        gridCellsJson: JSON.stringify(['cell_999_-122']),
      },
    });
    // System should properly handle this false data with a 400 Bad Request
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.json().success, false);
    assert.strictEqual(res.json().error.code, 'VALIDATION_ERROR');
  });

  it('Phase 11 (Negative): Reject Capsule Issue with unauthenticated/invalid token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/capsules/issue',
      headers: { Authorization: `Bearer invalid-token-123` },
      payload: {
        episodeId: activeEpisodeId,
        helperDeviceId: helperDevice._id.toString(),
        verificationData: { qrToken: 'fake-qr', blindedGridCell: 'cell' },
      },
    });
    // System should reject false token
    assert.strictEqual(res.statusCode, 401);
  });

  it('Phase 12 (Negative): Reject Capsule Redemption with fake/incorrect capsule token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/capsules/redeem',
      headers: { Authorization: `Bearer ${helperToken}` },
      payload: { capsuleToken: 'completely-fake-capsule-token.signature' },
    });
    // System should reject fake capsule token during redemption
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.json().success, false);
  });

  it('Phase 13 (Negative): Reject Socket connection to an episode room user does not belong to', async () => {
    // Create a 3rd "intruder" device
    const intruderKeyPair = generateTestKeyPair();
    const intruderDevice = await Device.create({
      deviceFingerprintHash: 'e2e-intruder-' + Math.random().toString(36).substring(2),
      publicKey: intruderKeyPair.publicKeyHex,
    });
    const intruderToken = await signToken({ sub: intruderDevice._id.toString() });

    const intruderSocket = Client(`http://localhost:${serverPort}`, {
      auth: { token: intruderToken },
    });

    await new Promise<void>((resolve) => { intruderSocket.on('connect', resolve); });

    // Intruder tries to join the active episode room
    const joinResult = await new Promise<any>((resolve) => {
      intruderSocket.emit('join_episode', { episodeId: activeEpisodeId }, (res: any) => resolve(res));
    });

    // System should reject unauthorized access to the room
    assert.strictEqual(joinResult.success, false);
    assert.strictEqual(joinResult.error, 'Not authorized to join this episode channel');

    intruderSocket.disconnect();
    await Device.findByIdAndDelete(intruderDevice._id);
  });
});

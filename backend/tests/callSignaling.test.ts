import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import nacl from 'tweetnacl';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { buildApp } from '../src/app';
import { connectDB } from '../src/utils/db';
import { initKeys, signToken } from '../src/services/KeyService';
import { initSockets } from '../src/sockets';
import { Device, Episode, Capsule } from '../src/models';

function generateTestKeyPair() {
  const pair = nacl.sign.keyPair();
  const publicKeyHex = Buffer.from(pair.publicKey).toString('hex');
  return { pair, publicKeyHex };
}

describe('VoIP Call Signaling Socket Events', () => {
  const app = buildApp();
  let serverPort: number;
  let callerSocket: ClientSocket;
  let calleeSocket: ClientSocket;
  let callerToken: string;
  let calleeToken: string;
  let testEpisodeId: string;
  let reqDeviceDoc: any;
  let respDeviceDoc: any;
  let episodeDoc: any;
  let capsuleDoc: any;
  let currentCallId: string;

  before(async () => {
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connify-call-test';
    process.env.JWT_SECRET = 'test-secret-call-key-1234567890123456';
    await connectDB();
    await initKeys();

    await app.ready();
    const address = await app.listen({ port: 0, host: '127.0.0.1' });
    serverPort = Number(address.split(':').pop());
    initSockets(app.server);

    const callerKeys = generateTestKeyPair();
    const calleeKeys = generateTestKeyPair();

    reqDeviceDoc = await Device.create({
      deviceFingerprintHash: 'call-req-' + Math.random().toString(36).substring(2),
      publicKey: callerKeys.publicKeyHex,
    });

    respDeviceDoc = await Device.create({
      deviceFingerprintHash: 'call-resp-' + Math.random().toString(36).substring(2),
      publicKey: calleeKeys.publicKeyHex,
    });

    episodeDoc = await Episode.create({
      requesterDeviceId: reqDeviceDoc._id,
      category: 'MEDICAL',
      urgency: 4,
      status: 'matched',
      blindedGridCell: 'CELL-CALL-01',
      latitude: 12.9716,
      longitude: 77.5946,
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716],
      },
      expiresAt: new Date(Date.now() + 600000),
    });

    testEpisodeId = episodeDoc._id.toString();

    capsuleDoc = await Capsule.create({
      episodeId: episodeDoc._id,
      helperDeviceId: respDeviceDoc._id,
      signedTokenHash: 'call-test-capsule-hash',
      status: 'issued',
      expiresAt: new Date(Date.now() + 600000),
    });

    callerToken = await signToken({ sub: reqDeviceDoc._id.toString() });
    calleeToken = await signToken({ sub: respDeviceDoc._id.toString() });

    const socketUrl = `http://127.0.0.1:${serverPort}`;

    callerSocket = Client(socketUrl, {
      auth: { token: callerToken },
      transports: ['websocket'],
    });

    calleeSocket = Client(socketUrl, {
      auth: { token: calleeToken },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve) => {
      let ready = 0;
      const onConnect = () => {
        ready++;
        if (ready === 2) resolve();
      };
      callerSocket.on('connect', onConnect);
      calleeSocket.on('connect', onConnect);
    });

    // Both join the episode room
    await new Promise<void>((resolve, reject) => {
      callerSocket.emit('join_episode', { episodeId: testEpisodeId }, (res1: any) => {
        if (!res1.success) return reject(new Error(res1.error));
        calleeSocket.emit('join_episode', { episodeId: testEpisodeId }, (res2: any) => {
          if (!res2.success) return reject(new Error(res2.error));
          resolve();
        });
      });
    });
  });

  after(async () => {
    callerSocket?.disconnect();
    calleeSocket?.disconnect();
    if (capsuleDoc) await Capsule.findByIdAndDelete(capsuleDoc._id);
    if (episodeDoc) await Episode.findByIdAndDelete(episodeDoc._id);
    if (reqDeviceDoc) await Device.findByIdAndDelete(reqDeviceDoc._id);
    if (respDeviceDoc) await Device.findByIdAndDelete(respDeviceDoc._id);
    await app.close();
    await mongoose.disconnect();
  });

  it('1. Vends STUN/TURN ICE servers via socket and REST', async () => {
    const socketRes = await new Promise<any>((resolve) => {
      callerSocket.emit('get_ice_servers', (res: any) => resolve(res));
    });
    assert.strictEqual(socketRes.success, true);
    assert.ok(Array.isArray(socketRes.iceServers));
    assert.ok(socketRes.iceServers.length > 0);

    const restRes = await app.inject({
      method: 'GET',
      url: '/api/webrtc/ice-servers',
      headers: { authorization: `Bearer ${callerToken}` },
    });
    assert.strictEqual(restRes.statusCode, 200);
    const body = JSON.parse(restRes.payload);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.iceServers));
  });

  it('2. Caller initiates call -> Callee receives incoming_call with unique callId', async () => {
    const incomingPromise = new Promise<any>((resolve) => {
      calleeSocket.once('incoming_call', (data) => {
        resolve(data);
      });
    });

    const ack = await new Promise<any>((resolve) => {
      callerSocket.emit('call_initiate', {
        episodeId: testEpisodeId,
        callerName: 'Alex Requester',
        role: 'requester',
      }, (res: any) => resolve(res));
    });

    assert.strictEqual(ack.success, true);
    assert.ok(ack.callId);
    currentCallId = ack.callId;

    const incomingData = await incomingPromise;
    assert.strictEqual(incomingData.episodeId, testEpisodeId);
    assert.strictEqual(incomingData.callId, currentCallId);
    assert.strictEqual(incomingData.callerName, 'Alex Requester');
    assert.strictEqual(incomingData.role, 'requester');
  });

  it('3. Callee accepts call -> Caller receives call_accepted payload', async () => {
    const acceptedPromise = new Promise<any>((resolve) => {
      callerSocket.once('call_accepted', (data) => {
        resolve(data);
      });
    });

    const ack = await new Promise<any>((resolve) => {
      calleeSocket.emit('call_accept', {
        episodeId: testEpisodeId,
        callId: currentCallId,
      }, (res: any) => resolve(res));
    });

    assert.strictEqual(ack.success, true);
    const acceptedData = await acceptedPromise;
    assert.strictEqual(acceptedData.episodeId, testEpisodeId);
    assert.strictEqual(acceptedData.callId, currentCallId);
  });

  it('4. Audio signaling payload passes between peers', async () => {
    const signalPromise = new Promise<any>((resolve) => {
      callerSocket.once('call_signal', (data) => {
        resolve(data);
      });
    });

    const ack = await new Promise<any>((resolve) => {
      calleeSocket.emit('call_signal', {
        episodeId: testEpisodeId,
        callId: currentCallId,
        signalData: { type: 'candidate', sdp: 'dummy-sdp-audio' },
      }, (res: any) => resolve(res));
    });

    assert.strictEqual(ack.success, true);
    const signalData = await signalPromise;
    assert.strictEqual(signalData.episodeId, testEpisodeId);
    assert.deepStrictEqual(signalData.signalData, { type: 'candidate', sdp: 'dummy-sdp-audio' });
  });

  it('5. 1-to-1 WebRTC SDP offer, answer, and ICE candidates relay directly', async () => {
    const offerPromise = new Promise<any>((resolve) => {
      calleeSocket.once('webrtc_offer', (data) => resolve(data));
    });
    callerSocket.emit('webrtc_offer', {
      receiverId: respDeviceDoc._id.toString(),
      offer: { type: 'offer', sdp: 'mock-offer-sdp' },
      callId: currentCallId,
    });
    const offerData = await offerPromise;
    assert.strictEqual(offerData.callerId, reqDeviceDoc._id.toString());
    assert.strictEqual(offerData.offer.sdp, 'mock-offer-sdp');

    const answerPromise = new Promise<any>((resolve) => {
      callerSocket.once('webrtc_answer', (data) => resolve(data));
    });
    calleeSocket.emit('webrtc_answer', {
      receiverId: reqDeviceDoc._id.toString(),
      answer: { type: 'answer', sdp: 'mock-answer-sdp' },
      callId: currentCallId,
    });
    const answerData = await answerPromise;
    assert.strictEqual(answerData.responderId, respDeviceDoc._id.toString());
    assert.strictEqual(answerData.answer.sdp, 'mock-answer-sdp');

    const candidatePromise = new Promise<any>((resolve) => {
      calleeSocket.once('ice_candidate', (data) => resolve(data));
    });
    callerSocket.emit('ice_candidate', {
      receiverId: respDeviceDoc._id.toString(),
      candidate: { candidate: 'candidate:1 1 UDP 2130706431 127.0.0.1 5000 typ host' },
      callId: currentCallId,
    });
    const candidateData = await candidatePromise;
    assert.strictEqual(candidateData.senderId, reqDeviceDoc._id.toString());
  });

  it('6. Ending call broadcasts call_ended with duration', async () => {
    const endPromise = new Promise<any>((resolve) => {
      calleeSocket.once('call_ended', (data) => {
        resolve(data);
      });
    });

    const ack = await new Promise<any>((resolve) => {
      callerSocket.emit('call_end', {
        episodeId: testEpisodeId,
        callId: currentCallId,
        duration: 45,
      }, (res: any) => resolve(res));
    });

    assert.strictEqual(ack.success, true);
    const endData = await endPromise;
    assert.strictEqual(endData.episodeId, testEpisodeId);
    assert.strictEqual(endData.callId, currentCallId);
    assert.strictEqual(endData.duration, 45);
  });
});

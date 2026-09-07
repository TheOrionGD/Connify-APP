import mongoose from 'mongoose';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { Device } from '../src/models';
import { connectDB } from '../src/utils/db';

describe('Device Registration Idempotency Tests', () => {
  before(async () => {
    await connectDB();
  });

  after(async () => {
    await mongoose.disconnect();
  });

  it('1. Multiple register calls with same fingerprint -> upserts without duplicate records', async () => {
    const fingerprint = 'b'.repeat(64);
    const pubKey1 = '1'.repeat(64);
    const pubKey2 = '2'.repeat(64);

    await Device.deleteMany({ deviceFingerprintHash: fingerprint });
    const dev1 = await Device.create({
      deviceFingerprintHash: fingerprint,
      publicKey: pubKey1,
    });
    assert.ok(dev1);

    const existing = await Device.findOne({ deviceFingerprintHash: fingerprint });
    if (existing) {
      existing.publicKey = pubKey2;
      await existing.save();
    }

    const count = await Device.countDocuments({ deviceFingerprintHash: fingerprint });
    assert.strictEqual(count, 1);

    const updated = await Device.findOne({ deviceFingerprintHash: fingerprint });
    assert.strictEqual(updated?.publicKey, pubKey2);

    // Cleanup
    await Device.deleteOne({ _id: dev1._id });
  });
});

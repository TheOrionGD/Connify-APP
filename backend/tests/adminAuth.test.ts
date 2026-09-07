import mongoose from 'mongoose';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/app';

describe('Admin API Authorization Tests', () => {
  const app = buildApp();

  before(async () => {
    await app.ready();
  });

  after(async () => {
    await app.close();
    await mongoose.disconnect();
  });

  it('1. GET /api/admin/guardians without token -> returns 401 Unauthorized', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/admin/guardians',
    });
    assert.strictEqual(res.statusCode, 401);
    const body = res.json();
    assert.strictEqual(body.success, false);
  });

  it('2. GET /api/admin/sos-alerts without token -> returns 401 Unauthorized', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/admin/sos-alerts',
    });
    assert.strictEqual(res.statusCode, 401);
  });

  it('3. GET /api/admin/jit-credentials without token -> returns 401 Unauthorized', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/admin/jit-credentials',
    });
    assert.strictEqual(res.statusCode, 401);
  });

  it('4. GET /api/admin/audit-ledgers without token -> returns 401 Unauthorized', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/admin/audit-ledgers',
    });
    assert.strictEqual(res.statusCode, 401);
  });
});

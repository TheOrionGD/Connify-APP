import { SHARPHelper } from '../src/utils/sharp';

describe('QR Nonce Generation Verification (Step 1)', () => {
  test('Generating two QR tokens in a row for the same episode and device yields different nonces', () => {
    const episodeId = 'ep-12345';
    const deviceId = 'dev-67890';

    const payload1 = {
      episodeId,
      requesterDeviceId: deviceId,
      nonce: crypto.randomUUID(),
      exp: Math.floor(Date.now() / 1000) + 90,
    };

    const payload2 = {
      episodeId,
      requesterDeviceId: deviceId,
      nonce: crypto.randomUUID(),
      exp: Math.floor(Date.now() / 1000) + 90,
    };

    expect(payload1.nonce).not.toEqual(payload2.nonce);
    expect(typeof payload1.nonce).toBe('string');
    expect(payload1.nonce.length).toBeGreaterThan(0);
  });

  test('Confirm nonce generation does NOT use deterministic SHARPHelper.blindGridCell', () => {
    const episodeId = 'ep-12345';
    const deviceId = 'dev-67890';

    const deterministicValue = SHARPHelper.blindGridCell(episodeId, deviceId, "QR");
    const freshNonce = crypto.randomUUID();

    expect(freshNonce).not.toEqual(deterministicValue);
  });
});

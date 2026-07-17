import { BCH157, BloomFilter, SHARPHelper } from '../src/utils/sharp';

describe('SHARP Cryptographic and Protocol Helper Utilities', () => {
  describe('BCH(15, 7) Error Correction Code', () => {
    test('encode/decode correct message without errors', () => {
      const msg = 0x5A; // 7-bit message
      const encoded = BCH157.encode(msg);
      
      // Expected msg is in upper 7 bits of the 15-bit codeword
      const decoded = BCH157.decode(encoded);
      const decodedMsg = (decoded >> 8) & 0x7F;
      expect(decodedMsg).toBe(msg);
    });

    test('recovers from a single-bit error', () => {
      const msg = 0x3F;
      const encoded = BCH157.encode(msg);

      // Introduce a single bit error at bit position 4
      const corrupted = encoded ^ (1 << 4);
      const corrected = BCH157.decode(corrupted);
      
      const decodedMsg = (corrected >> 8) & 0x7F;
      expect(decodedMsg).toBe(msg);
    });

    test('recovers from a double-bit error', () => {
      const msg = 0x12;
      const encoded = BCH157.encode(msg);

      // Introduce two bit errors at bit positions 2 and 9
      const corrupted = encoded ^ (1 << 2) ^ (1 << 9);
      const corrected = BCH157.decode(corrupted);

      const decodedMsg = (corrected >> 8) & 0x7F;
      expect(decodedMsg).toBe(msg);
    });

    test('fails to recover and returns received codeword for 3-bit errors (beyond capability)', () => {
      const msg = 0x45;
      const encoded = BCH157.encode(msg);

      // Introduce 3 bit errors
      const corrupted = encoded ^ (1 << 1) ^ (1 << 5) ^ (1 << 10);
      const corrected = BCH157.decode(corrupted);

      expect(corrected).toBe(corrupted);
    });
  });

  describe('Bloom Filter', () => {
    test('adds and tests items correctly', () => {
      const filter = new BloomFilter(256, 3);
      
      filter.add('alice');
      filter.add('bob');
      
      expect(filter.test('alice')).toBe(true);
      expect(filter.test('bob')).toBe(true);
      expect(filter.test('charlie')).toBe(false);
    });

    test('gets and sets bits correctly', () => {
      const filterA = new BloomFilter(128, 4);
      filterA.add('hello');

      const bits = filterA.getBits();
      
      const filterB = new BloomFilter(128, 4);
      expect(filterB.test('hello')).toBe(false);
      
      filterB.setBits(bits);
      expect(filterB.test('hello')).toBe(true);
    });
  });

  describe('SHARPHelper', () => {
    test('blindGridCell returns deterministic hash', () => {
      const key = 'session-secret-key';
      const cell = 'cell-latitude-10.7-longitude-78.7';
      const role = 'requester';
      
      const blind1 = SHARPHelper.blindGridCell(key, cell, role);
      const blind2 = SHARPHelper.blindGridCell(key, cell, role);
      
      expect(blind1).toHaveLength(64); // SHA-256 output is 64 hex chars
      expect(blind1).toBe(blind2);
    });

    test('generateSyndromes and reconstruct correctly transmits Bloom Filter bits', () => {
      // Create Alice's Bloom filter
      const filterAlice = new BloomFilter(1024, 4);
      filterAlice.add('req-1');
      filterAlice.add('req-2');
      filterAlice.add('req-3');

      // Generate syndromes from Alice's filter
      const syndromes = SHARPHelper.generateSyndromes(filterAlice.getBits());
      expect(typeof syndromes).toBe('string');
      expect(syndromes.length).toBe(292); // 146 blocks * 2 hex chars per parity byte = 292 hex chars

      // Create Bob's Bloom filter (slightly different or empty)
      const filterBob = new BloomFilter(1024, 4);
      // Bob doesn't have req-3, but has req-1 and req-2
      filterBob.add('req-1');
      filterBob.add('req-2');

      // Reconstruct Alice's filter from Bob's filter and the syndromes
      const reconstructedBits = SHARPHelper.reconstruct(filterBob.getBits(), syndromes);
      
      const filterReconstructed = new BloomFilter(1024, 4);
      filterReconstructed.setBits(reconstructedBits);

      // Verify that filterReconstructed matches Alice's filter contents
      expect(filterReconstructed.test('req-1')).toBe(true);
      expect(filterReconstructed.test('req-2')).toBe(true);
      expect(filterReconstructed.test('req-3')).toBe(true);
      expect(filterReconstructed.test('req-4')).toBe(false);
    });
  });
});

// ── Hex Helper Functions for React Native (No Buffer dependency) ─────
function bytesToHex(bytes: Uint8Array | number[]): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i]!.toString(16).padStart(2, '0');
  }
  return hex;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// ── Pure JS Cryptographic Helper Functions ──────────────────────────
function fnv1a32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const words: number[] = [];
  const asciiLength = ascii.length;
  const bytes: number[] = [];
  for (let i = 0; i < asciiLength; i++) {
    bytes.push(ascii.charCodeAt(i));
  }
  
  const bitCount = bytes.length * 8;
  bytes.push(0x80);
  
  while ((bytes.length * 8) % 512 !== 448) {
    bytes.push(0);
  }
  
  const bitsHex = bitCount.toString(16).padStart(16, '0');
  for (let i = 0; i < 8; i++) {
    bytes.push(parseInt(bitsHex.substring(i * 2, i * 2 + 2), 16));
  }
  
  for (let i = 0; i < bytes.length; i += 4) {
    words.push((bytes[i]! << 24) | (bytes[i+1]! << 16) | (bytes[i+2]! << 8) | bytes[i+3]!);
  }
  
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;
  
  for (let i = 0; i < words.length; i += 16) {
    const w = new Int32Array(64);
    for (let t = 0; t < 16; t++) {
      w[t] = words[i + t]!;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rightRotate(w[t-15]!, 7) ^ rightRotate(w[t-15]!, 18) ^ (w[t-15]! >>> 3);
      const s1 = rightRotate(w[t-2]!, 17) ^ rightRotate(w[t-2]!, 19) ^ (w[t-2]! >>> 10);
      w[t] = w[t-16]! + s0 + w[t-7]! + s1;
    }
    
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;
    
    for (let t = 0; t < 64; t++) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = h + s1 + ch + k[t]! + w[t]!;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = s0 + maj;
      
      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }
    
    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }
  
  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4) + toHex(h5) + toHex(h6) + toHex(h7);
}

// ── Galois Field GF(2^4) Arithmetic for BCH(15,7) ─────────────────────
const GF_ORDER = 15;
const GF_EXP = new Int32Array(32);
const GF_LOG = new Int32Array(16);

(function initGF() {
  let val = 1;
  for (let i = 0; i < GF_ORDER; i++) {
    GF_EXP[i] = val;
    GF_EXP[i + GF_ORDER] = val;
    GF_LOG[val] = i;
    
    val <<= 1;
    if (val & 0x10) {
      val ^= 0x13;
    }
  }
  GF_LOG[0] = -1;
})();

function gfAdd(a: number, b: number): number {
  return a ^ b;
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function gfDiv(a: number, b: number): number {
  if (a === 0) return 0;
  if (b === 0) throw new Error('Division by zero in GF(2^4)');
  let diff = GF_LOG[a] - GF_LOG[b];
  if (diff < 0) diff += GF_ORDER;
  return GF_EXP[diff];
}

// ── BCH(15, 7) Code Implementation ────────────────────────────────────
const BCH_GEN = 0x1D1;

export class BCH157 {
  static encode(msg: number): number {
    msg &= 0x7F;
    let remainder = msg << 8;
    for (let i = 6; i >= 0; i--) {
      if ((remainder >> (i + 8)) & 1) {
        remainder ^= BCH_GEN << i;
      }
    }
    return (msg << 8) | remainder;
  }

  static decode(received: number): number {
    received &= 0x7FFF;

    const s = new Int32Array(5);
    let anyError = false;
    for (let j = 1; j <= 4; j++) {
      let val = 0;
      const alpha_j = GF_EXP[j];
      for (let i = 14; i >= 0; i--) {
        const bit = (received >> i) & 1;
        val = gfAdd(gfMul(val, alpha_j), bit);
      }
      s[j] = val;
      if (val !== 0) anyError = true;
    }

    if (!anyError) {
      return received;
    }

    let l1 = 0;
    let l2 = 0;
    const det = gfAdd(gfMul(s[1], s[3]), gfMul(s[2], s[2]));

    if (det !== 0) {
      l1 = gfDiv(gfAdd(gfMul(s[2], s[3]), gfMul(s[1], s[4])), det);
      l2 = gfDiv(gfAdd(gfMul(s[3], s[3]), gfMul(s[2], s[4])), det);
    } else {
      if (s[1] !== 0) {
        l1 = s[1];
        l2 = 0;
      } else {
        return received;
      }
    }

    let corrected = received;
    let errorCount = 0;
    for (let i = 0; i < 15; i++) {
      const x = GF_EXP[(15 - i) % 15];
      const x2 = gfMul(x, x);
      const evalLambda = gfAdd(1, gfAdd(gfMul(l1, x), gfMul(l2, x2)));
      if (evalLambda === 0) {
        corrected ^= 1 << i;
        errorCount++;
      }
    }

    const expectedErrors = l2 !== 0 ? 2 : 1;
    if (errorCount !== expectedErrors) {
      return received;
    }

    return corrected;
  }
}

// ── Bloom Filter ──────────────────────────────────────────────────────
export class BloomFilter {
  private bits: Uint8Array;
  
  constructor(public sizeBits: number = 1024, private hashCount: number = 4) {
    this.bits = new Uint8Array(Math.ceil(sizeBits / 8));
  }

  add(item: string): void {
    for (let i = 0; i < this.hashCount; i++) {
      const hash = fnv1a32(`${item}:${i}`);
      const bitIndex = hash % this.sizeBits;
      const byteIndex = Math.floor(bitIndex / 8);
      const bitOffset = bitIndex % 8;
      this.bits[byteIndex] |= 1 << bitOffset;
    }
  }

  getBits(): Uint8Array {
    return this.bits;
  }

  setBits(newBits: Uint8Array): void {
    if (newBits.length === this.bits.length) {
      this.bits.set(newBits);
    }
  }

  test(item: string): boolean {
    for (let i = 0; i < this.hashCount; i++) {
      const hash = fnv1a32(`${item}:${i}`);
      const bitIndex = hash % this.sizeBits;
      const byteIndex = Math.floor(bitIndex / 8);
      const bitOffset = bitIndex % 8;
      if (((this.bits[byteIndex] >> bitOffset) & 1) === 0) {
        return false;
      }
    }
    return true;
  }
}

// ── SHARP Proximity Protocol Engine ───────────────────────────────────
export class SHARPHelper {
  static generateSyndromes(bloomBits: Uint8Array): string {
    const syndromes: number[] = [];
    
    const getNext7Bits = (index: number): number => {
      let val = 0;
      for (let i = 0; i < 7; i++) {
        const globalBitIndex = index * 7 + i;
        if (globalBitIndex >= 1024) break;
        const byteIdx = Math.floor(globalBitIndex / 8);
        const bitOffset = globalBitIndex % 8;
        const bit = (bloomBits[byteIdx] >> bitOffset) & 1;
        val |= bit << i;
      }
      return val;
    };

    const blocksCount = 146;
    for (let i = 0; i < blocksCount; i++) {
      const msg7 = getNext7Bits(i);
      const codeword15 = BCH157.encode(msg7);
      const parity8 = codeword15 & 0xFF;
      syndromes.push(parity8);
    }

    return bytesToHex(syndromes);
  }

  static reconstruct(bloomBob: Uint8Array, syndromesHex: string): Uint8Array {
    const syndromes = hexToBytes(syndromesHex);
    const reconstructedBits = new Uint8Array(Math.ceil(1024 / 8));
    
    const setReconstructed7Bits = (index: number, val7: number) => {
      for (let i = 0; i < 7; i++) {
        const globalBitIndex = index * 7 + i;
        if (globalBitIndex >= 1024) break;
        const byteIdx = Math.floor(globalBitIndex / 8);
        const bitOffset = globalBitIndex % 8;
        const bit = (val7 >> i) & 1;
        if (bit) {
          reconstructedBits[byteIdx] |= 1 << bitOffset;
        }
      }
    };

    const getBob7Bits = (index: number): number => {
      let val = 0;
      for (let i = 0; i < 7; i++) {
        const globalBitIndex = index * 7 + i;
        if (globalBitIndex >= 1024) break;
        const byteIdx = Math.floor(globalBitIndex / 8);
        const bitOffset = globalBitIndex % 8;
        const bit = (bloomBob[byteIdx] >> bitOffset) & 1;
        val |= bit << i;
      }
      return val;
    };

    const blocksCount = Math.min(146, syndromes.length);
    for (let i = 0; i < blocksCount; i++) {
      const bob7 = getBob7Bits(i);
      const parity8 = syndromes[i]!;
      const receivedCodeword = (bob7 << 8) | parity8;
      
      const correctedCodeword = BCH157.decode(receivedCodeword);
      const correctedMsg7 = (correctedCodeword >> 8) & 0x7F;
      setReconstructed7Bits(i, correctedMsg7);
    }

    return reconstructedBits;
  }

  static blindGridCell(key: string, cell: string, role: string): string {
    return sha256(`${key}:${cell}:${role}`);
  }
}

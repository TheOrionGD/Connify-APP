import { BloomFilter, SHARPHelper } from './sharp';
import fs from 'fs';
import path from 'path';

// Helper to track metrics
class TaskTracker {
  times: number[] = [];
  
  record(fn: () => void) {
    const start = process.hrtime.bigint();
    fn();
    const end = process.hrtime.bigint();
    this.times.push(Number(end - start) / 1e6); // in ms
  }

  getMetrics() {
    this.times.sort((a, b) => a - b);
    const O = this.times[0]; // Optimistic (Min)
    const P = this.times[this.times.length - 1]; // Pessimistic (Max)
    const sum = this.times.reduce((a, b) => a + b, 0);
    const M = sum / this.times.length; // Most Likely (Average)
    const E = (O + 4 * M + P) / 6; // Expected Duration
    return { O, M, P, E };
  }
}

function runRealAnalysis() {
  const iterations = 1000;
  
  // Baseline Tasks
  const t_hav_init = new TaskTracker();
  const t_hav_delta = new TaskTracker();
  const t_hav_core = new TaskTracker();
  const t_hav_dist = new TaskTracker();
  const t_hav_thresh = new TaskTracker();

  // SHARP Tasks
  const t_quantize = new TaskTracker();
  const t_bloomAdd = new TaskTracker();
  const t_bchEncode = new TaskTracker();
  const t_blind = new TaskTracker();
  const t_bchDecode = new TaskTracker();
  const t_match = new TaskTracker();

  // Data
  const lat1 = 37.7749, lon1 = -122.4194;
  const lat2 = 37.7750, lon2 = -122.4195;
  const sessionKey = "session-123456789";

  for (let i = 0; i < iterations; i++) {
    // --- Baseline (Broken Down into Tasks) ---
    let R = 0, rad = 0, φ1 = 0, φ2 = 0;
    t_hav_init.record(() => {
      R = 6371e3; 
      rad = Math.PI / 180;
      φ1 = lat1 * rad;
      φ2 = lat2 * rad;
    });

    let Δφ = 0, Δλ = 0;
    t_hav_delta.record(() => {
      Δφ = (lat2 - lat1) * rad;
      Δλ = (lon2 - lon1) * rad;
    });

    let a = 0, c = 0;
    t_hav_core.record(() => {
      a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
      c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    });

    let dist = 0;
    t_hav_dist.record(() => {
      dist = R * c;
    });

    let isMatch = false;
    t_hav_thresh.record(() => {
      isMatch = dist < 10;
    });

    // --- SHARP ---
    // 1. Quantize (simulated fast)
    let cellsA: string[] = [];
    let cellsB: string[] = [];
    t_quantize.record(() => {
      cellsA = ["37.774,-122.419", "37.775,-122.419", "37.774,-122.420", "37.775,-122.420", "37.776,-122.419", "37.774,-122.418", "37.775,-122.418", "37.776,-122.420", "37.776,-122.418"];
      cellsB = ["37.775,-122.419", "37.776,-122.419", "37.775,-122.420", "37.776,-122.420", "37.777,-122.419", "37.775,-122.418", "37.776,-122.418", "37.777,-122.420", "37.777,-122.418"];
    });

    // 2. Bloom Add
    const bloomA = new BloomFilter(1024, 4);
    const bloomB = new BloomFilter(1024, 4);
    t_bloomAdd.record(() => {
      for (const cell of cellsA) bloomA.add(cell);
      for (const cell of cellsB) bloomB.add(cell);
    });

    // 3. BCH Encode (Syndromes)
    let syndromesA: string = "";
    t_bchEncode.record(() => {
      syndromesA = SHARPHelper.generateSyndromes(bloomA.getBits());
    });

    // 4. Blind
    let blindedA: string[] = [];
    t_blind.record(() => {
      blindedA = cellsA.map(c => SHARPHelper.blindGridCell(sessionKey, c, "Alice"));
    });

    // 5. BCH Decode (Reconstruct)
    let reconstructedBitsA: Uint8Array = new Uint8Array();
    t_bchDecode.record(() => {
      reconstructedBitsA = SHARPHelper.reconstruct(bloomB.getBits(), syndromesA);
    });

    // 6. Match
    t_match.record(() => {
      let matchCount = 0;
      const blindedB = cellsB.map(c => SHARPHelper.blindGridCell(sessionKey, c, "Bob"));
      for (const b of blindedB) {
        if (blindedA.includes(b)) matchCount++;
      }
    });
  }

  const baselineData = {
    init: t_hav_init.getMetrics(),
    delta: t_hav_delta.getMetrics(),
    core: t_hav_core.getMetrics(),
    dist: t_hav_dist.getMetrics(),
    thresh: t_hav_thresh.getMetrics()
  };

  const sharpData = {
    quantize: t_quantize.getMetrics(),
    bloomAdd: t_bloomAdd.getMetrics(),
    bchEncode: t_bchEncode.getMetrics(),
    blind: t_blind.getMetrics(),
    bchDecode: t_bchDecode.getMetrics(),
    match: t_match.getMetrics()
  };

  const fullData = { baselineData, sharpData };
  fs.writeFileSync(path.join(__dirname, '..', '..', '..', 'cpm_real_data_detailed.json'), JSON.stringify(fullData, null, 2));
  console.log("Detailed JSON Data Saved.");
}

runRealAnalysis();

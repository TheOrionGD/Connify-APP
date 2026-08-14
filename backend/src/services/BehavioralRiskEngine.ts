import { Device, Episode, Outcome } from '../models';
import { LocationWatchdogService } from './LocationWatchdogService';

export interface HarmlessnessAssessmentResult {
  score: number;
  isQuarantined: boolean;
  isVelocityCapped: boolean;
  recentEpisodesCount: number;
  resolutionRatio: number;
  reason?: string;
}

export class BehavioralRiskEngine {
  /**
   * Calculates real-time Harmlessness Score (0-100) using real DB queries.
   * STRICT SECURITY: Zero mock data, zero dummy overrides.
   */
  public static async calculateHarmlessnessScore(deviceId: string): Promise<HarmlessnessAssessmentResult> {
    const device = await Device.findById(deviceId);
    if (!device) {
      return {
        score: 0,
        isQuarantined: true,
        isVelocityCapped: true,
        recentEpisodesCount: 0,
        resolutionRatio: 0,
        reason: 'Device record not found.',
      };
    }

    if (device.isQuarantined) {
      return {
        score: 0,
        isQuarantined: true,
        isVelocityCapped: false,
        recentEpisodesCount: 0,
        resolutionRatio: 0,
        reason: 'Device is quarantined due to safety violations.',
      };
    }

    // 1. Velocity & Luring Detection (Past 10 Minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentEpisodesCount = await Episode.countDocuments({
      requesterDeviceId: device._id,
      createdAt: { $gte: tenMinutesAgo },
    });

    let isVelocityCapped = false;
    let scorePenalty = 0;

    // Triggering > 2 episodes in 10 minutes indicates potential predatory lure / spam setup
    if (recentEpisodesCount >= 2) {
      isVelocityCapped = true;
      scorePenalty += (recentEpisodesCount - 1) * 40;
    }

    // 2. Historical Resolution Ratio
    const allUserEpisodes = await Episode.find({ requesterDeviceId: device._id }).select('_id');
    const episodeIds = allUserEpisodes.map((ep) => ep._id);

    let resolutionRatio = 1.0;
    if (episodeIds.length > 0) {
      const outcomes = await Outcome.find({ episodeId: { $in: episodeIds } });
      const successfulCount = outcomes.filter((o) => o.result === 'success' || o.result === 'SAFE_RESOLVED').length;
      resolutionRatio = outcomes.length > 0 ? successfulCount / outcomes.length : 1.0;
    }

    // Penalize low resolution ratio
    if (resolutionRatio < 0.5 && episodeIds.length >= 3) {
      scorePenalty += Math.round((1 - resolutionRatio) * 30);
    }

    // Penalize prior suspicious reports
    if (device.suspiciousCount && device.suspiciousCount > 0) {
      scorePenalty += device.suspiciousCount * 35;
    }

    const calculatedScore = Math.max(0, 100 - scorePenalty);

    // Persist updated score
    device.harmlessnessScore = calculatedScore;
    await device.save();

    return {
      score: calculatedScore,
      isQuarantined: device.isQuarantined || false,
      isVelocityCapped,
      recentEpisodesCount,
      resolutionRatio,
      reason: isVelocityCapped ? 'Excessive trigger velocity detected (Luring Prevention).' : undefined,
    };
  }

  /**
   * Assesses device eligibility prior to letting an emergency episode trigger.
   * Throws explicit error if device is quarantined or fails harmlessness threshold.
   */
  public static async assertEligibilityForEpisodeTrigger(deviceId: string): Promise<void> {
    // 0. Enforce mandatory guardian registration requirement
    await LocationWatchdogService.assertMandatoryGuardian(deviceId);

    const assessment = await this.calculateHarmlessnessScore(deviceId);

    if (assessment.isQuarantined) {
      throw new Error('QUARANTINED_DEVICE: Account is quarantined due to safety flags.');
    }

    if (assessment.isVelocityCapped) {
      throw new Error('PREDATORY_LURING_DETECTED: Excessive trigger velocity. Episode creation blocked for safety.');
    }

    if (assessment.score < 40) {
      throw new Error(`HARMLESSNESS_SCORE_TOO_LOW: Harmlessness score (${assessment.score}/100) below safety threshold.`);
    }
  }
}

import { Injectable, signal, computed } from '@angular/core';

export type ConfidenceStake = 'HIGH' | 'MODERATE' | 'SKEPTICAL';

export interface IBrierStakeRecord {
  id: string;
  recommendationId: string;
  stake: ConfidenceStake;
  stakedAt: number;
  actualOutcome?: number; // 1 = Success/Verified, 0 = Rejected/Unverified
  brierScore?: number;
}

export interface ISignalingBadge {
  id: string;
  topic: string;
  badgeName: string;
  earnedAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalGameTheoryService {
  // 1. Mechanism Design: Staked Brier Score Records
  readonly stakes = signal<IBrierStakeRecord[]>([]);

  // 2. Axelrod Tit-for-Tat Reciprocity Logging Streak
  readonly patientLoggingStreak = signal<number>(5);

  // 3. Spence Signaling Badges
  readonly literacyBadges = signal<ISignalingBadge[]>([]);

  // 4. Public Goods Altruism Data Contribution Counter
  readonly totalContributors = signal<number>(1420);
  readonly researchSwarmsAccelerated = signal<number>(18);

  // --- Computed Brier Score (Mechanism Design) ---
  readonly brierScore = computed(() => {
    const list = this.stakes().filter(s => s.actualOutcome !== undefined);
    if (list.length === 0) return 0.08; // Baseline well-calibrated score

    const sum = list.reduce((acc, curr) => {
      const forecastProb = curr.stake === 'HIGH' ? 0.9 : curr.stake === 'MODERATE' ? 0.6 : 0.2;
      const error = forecastProb - (curr.actualOutcome || 0);
      return acc + (error * error);
    }, 0);

    return Number((sum / list.length).toFixed(3));
  });

  // --- Computed Reciprocity State (Axelrod Tit-for-Tat) ---
  readonly reciprocityState = computed(() => {
    const streak = this.patientLoggingStreak();
    if (streak >= 5) {
      return {
        status: 'MUTUAL_COOPERATION',
        rewardUnlocked: '🌟 Bio-Individualized Nutrition & Priority Consult Access Unlocked',
        forgivingMessage: null
      };
    } else if (streak >= 3) {
      return {
        status: 'BUILDING_RECIPROCITY',
        rewardUnlocked: '⚡ 2 Days Away from Unlocking Priority Access',
        forgivingMessage: null
      };
    } else {
      return {
        status: 'FORGIVING_RE_ENTRY',
        rewardUnlocked: 'Standard Access',
        forgivingMessage: '💚 Take 1 quick minute to log today’s vitals to resume your 5-day streak!'
      };
    }
  });

  /**
   * 1. Mechanism Design: Stake Clinician Confidence on a Recommendation
   */
  stakeConfidence(recommendationId: string, stake: ConfidenceStake): IBrierStakeRecord {
    const newRecord: IBrierStakeRecord = {
      id: 'stake_' + Math.random().toString(36).substring(2, 8),
      recommendationId,
      stake,
      stakedAt: Date.now()
    };

    this.stakes.update(list => [...list, newRecord]);
    return newRecord;
  }

  /**
   * Resolve outcome for Brier Score calculation
   */
  resolveOutcome(stakeId: string, actualOutcome: 1 | 0): void {
    this.stakes.update(list =>
      list.map(s => (s.id === stakeId ? { ...s, actualOutcome } : s))
    );
  }

  /**
   * 3. Spence Signaling: Award Health Literacy Badge on Socratic double-flip answer
   */
  awardLiteracyBadge(topic: string): ISignalingBadge {
    const badgeName = `Empowered Literacy: ${topic}`;
    const newBadge: ISignalingBadge = {
      id: 'badge_' + Math.random().toString(36).substring(2, 8),
      topic,
      badgeName,
      earnedAt: Date.now()
    };

    this.literacyBadges.update(badges => [...badges, newBadge]);
    return newBadge;
  }

  /**
   * 4. Prospect Theory: Convert Clinical Metric into Kahneman-Tversky Longevity Reserve Loss-Aversion Frame
   */
  formatLongevityReserveFrame(metricName: string, deltaValue: number): string {
    const yearsPreserved = Math.abs(deltaValue * 0.45).toFixed(1);
    if (metricName.toLowerCase().includes('kidney') || metricName.toLowerCase().includes('proteinuria')) {
      return `🛡️ Preserves ${yearsPreserved} years of microvascular kidney filtration reserve.`;
    } else if (metricName.toLowerCase().includes('glucose') || metricName.toLowerCase().includes('hba1c')) {
      return `🛡️ Preserves ${yearsPreserved} years of endothelial capillary flexibility.`;
    } else if (metricName.toLowerCase().includes('heart') || metricName.toLowerCase().includes('tachycardia')) {
      return `🛡️ Preserves ${yearsPreserved} years of vagal autonomic recovery reserve.`;
    }
    return `🛡️ Preserves ${yearsPreserved} years of biophysical functional reserve.`;
  }

  /**
   * 5. Public Goods: Increment De-Identified Data Contribution Pool
   */
  contributeToPublicGoodsPool(): void {
    this.totalContributors.update(c => c + 1);
  }
}

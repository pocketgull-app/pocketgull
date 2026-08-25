/**
 * Usage Meter Service — Firestore-backed per-tenant API usage counting
 * with monthly rollover and quota checking.
 *
 * Firestore schema:
 *   usage/{tenantId}/months/{YYYY-MM}
 *     ├── discovery_read: number
 *     ├── discovery_resolve: number
 *     ├── discovery_probe: number
 *     ├── tool_execution: number
 *     ├── pipeline_graph: number
 *     └── updatedAt: Timestamp
 *
 * @module server/services/usage-meter.service
 */
import { Firestore, FieldValue, Timestamp } from '@google-cloud/firestore';
import type { SubscriptionTier, UsageCategory } from './tier-config';
import { getQuotaLimit } from './tier-config';

let _db: Firestore | null = null;
function getDb(): Firestore {
  if (!_db) {
    _db = new Firestore();
  }
  return _db;
}

export interface IUsageSnapshot {
  discovery_read: number;
  discovery_resolve: number;
  discovery_probe: number;
  tool_execution: number;
  pipeline_graph: number;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface IQuotaCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  resetsAt: string;
}

export interface IUsageHistoryEntry {
  month: string;
  usage: IUsageSnapshot;
}

/**
 * Returns the current month key in YYYY-MM format.
 */
function currentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Returns the ISO 8601 timestamp for the first day of next month (quota reset).
 */
function nextMonthResetTimestamp(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

export class UsageMeterService {
  private readonly collectionName = 'usage';

  /**
   * Atomically increments the usage counter for a given tenant and category.
   * Creates the monthly document if it doesn't exist.
   */
  async recordUsage(tenantId: string, category: UsageCategory): Promise<void> {
    const monthKey = currentMonthKey();
    const docRef = getDb()
      .collection(this.collectionName)
      .doc(tenantId)
      .collection('months')
      .doc(monthKey);

    await docRef.set(
      {
        [category]: FieldValue.increment(1),
        updatedAt: Timestamp.now()
      },
      { merge: true }
    );
  }

  /**
   * Returns the current month's usage snapshot for a tenant.
   */
  async getUsage(tenantId: string, month?: string): Promise<IUsageSnapshot> {
    const monthKey = month || currentMonthKey();
    const docRef = getDb()
      .collection(this.collectionName)
      .doc(tenantId)
      .collection('months')
      .doc(monthKey);

    const doc = await docRef.get();

    if (!doc.exists) {
      return {
        discovery_read: 0,
        discovery_resolve: 0,
        discovery_probe: 0,
        tool_execution: 0,
        pipeline_graph: 0
      };
    }

    const data = doc.data() as Partial<IUsageSnapshot>;
    return {
      discovery_read: data.discovery_read || 0,
      discovery_resolve: data.discovery_resolve || 0,
      discovery_probe: data.discovery_probe || 0,
      tool_execution: data.tool_execution || 0,
      pipeline_graph: data.pipeline_graph || 0,
      updatedAt: data.updatedAt
    };
  }

  /**
   * Checks whether a tenant is within their quota for a specific category.
   * Returns the quota status including remaining calls.
   */
  async checkQuota(
    tenantId: string,
    tier: SubscriptionTier,
    category: UsageCategory
  ): Promise<IQuotaCheckResult> {
    const limit = getQuotaLimit(tier, category);
    const resetsAt = nextMonthResetTimestamp();

    // Unlimited quota
    if (limit === -1) {
      return { allowed: true, remaining: -1, limit: -1, used: 0, resetsAt };
    }

    // Zero quota = hard gated
    if (limit === 0) {
      return { allowed: false, remaining: 0, limit: 0, used: 0, resetsAt };
    }

    const usage = await this.getUsage(tenantId);
    const used = usage[category] || 0;
    const remaining = Math.max(0, limit - used);

    return {
      allowed: used < limit,
      remaining,
      limit,
      used,
      resetsAt
    };
  }

  /**
   * Returns usage history for the last N months.
   */
  async getUsageHistory(tenantId: string, months: number = 6): Promise<IUsageHistoryEntry[]> {
    const history: IUsageHistoryEntry[] = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const usage = await this.getUsage(tenantId, monthKey);
      history.push({ month: monthKey, usage });
    }

    return history;
  }
}

export const usageMeterService = new UsageMeterService();

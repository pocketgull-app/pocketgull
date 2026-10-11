// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

/**
 * 🛡️ PocketGull Zero-Cost IP Blocklist & Threat Auto-Ban Engine
 * 
 * Provides:
 * 1. Zero-cloud-cost in-memory IP blocking for known abusive proxy/bot networks.
 * 2. Automatic dynamic 24-hour banning for malicious path sweeps (.git/config, .env, wp-login, etc.).
 * 3. Immediate 403 Forbidden rejection preventing container cold-start exhaustion.
 */

export interface IBanRecord {
  bannedAt: number;
  expiresAt: number;
  reason: string;
}

// Pre-seeded static blocklist of known abusive scanner IPs (e.g. AS48090 proxy scanners)
export const STATIC_BLOCKED_IPS = new Set<string>([
  '93.123.109.152', // Flagged scanner: rapid-fire .git/config probe on 2026-10-08 (AS48090)
  ...(typeof process !== 'undefined' && process.env?.['BLOCKED_IPS']
    ? process.env['BLOCKED_IPS'].split(',').map(s => s.trim()).filter(Boolean)
    : [])
]);

// Dynamic in-memory ban map with TTL
export const DYNAMIC_BANNED_IPS = new Map<string, IBanRecord>();
export const DEFAULT_BAN_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Regex matching common web vulnerability scanners and automated exploit probes
export const MALICIOUS_PROBE_REGEX = /^\/(?:(?:wp-(?:admin|content|includes|login|config|cron|load)|phpmyadmin|pma|actuator|xmlrpc\.php|cgi-bin|\.aws|\.ssh)(?:[./]|$)|(?:[^\/]+\/)*\.(?:git|env|ds_store|bak|swp|sql|tar|zip)(?:[./]|$))/i;

export class IpBlocklistService {
  /**
   * Sanitizes and extracts client IP from reverse proxy headers
   */
  static extractClientIp(headers: Record<string, any> = {}, socketAddress: string = ''): string {
    const xff = headers['x-forwarded-for'];
    const raw = xff
      ? String(xff).split(',')[0].trim()
      : (socketAddress || '');
    return raw.replace(/^::ffff:/, '').trim();
  }

  /**
   * Determines if a request path represents an automated exploit or vulnerability sweep
   */
  static isMaliciousProbe(path: string): boolean {
    if (!path) return false;
    return MALICIOUS_PROBE_REGEX.test(path);
  }

  /**
   * Checks whether an IP address is blocked (either permanently or under active temporary ban)
   */
  static isBlocked(ip: string): boolean {
    if (!ip) return false;
    const cleanIp = ip.replace(/^::ffff:/, '').trim();

    if (STATIC_BLOCKED_IPS.has(cleanIp)) {
      return true;
    }

    const dynamicBan = DYNAMIC_BANNED_IPS.get(cleanIp);
    if (dynamicBan) {
      if (Date.now() < dynamicBan.expiresAt) {
        return true;
      }
      // Clean up expired ban
      DYNAMIC_BANNED_IPS.delete(cleanIp);
    }

    return false;
  }

  /**
   * Dynamically bans an offending IP for a specified duration
   */
  static banIp(ip: string, reason: string, durationMs: number = DEFAULT_BAN_DURATION_MS): void {
    if (!ip) return;
    const cleanIp = ip.replace(/^::ffff:/, '').trim();
    DYNAMIC_BANNED_IPS.set(cleanIp, {
      bannedAt: Date.now(),
      expiresAt: Date.now() + durationMs,
      reason
    });
  }

  /**
   * Removes an IP from dynamic ban list
   */
  static unbanIp(ip: string): boolean {
    const cleanIp = ip.replace(/^::ffff:/, '').trim();
    return DYNAMIC_BANNED_IPS.delete(cleanIp);
  }

  /**
   * Retrieves summary telemetry for active bans
   */
  static getTelemetry(): {
    staticBlockedCount: number;
    dynamicBannedCount: number;
    activeBans: Array<{ ip: string; reason: string; expiresAt: number }>;
  } {
    const now = Date.now();
    const active: Array<{ ip: string; reason: string; expiresAt: number }> = [];

    for (const [ip, record] of DYNAMIC_BANNED_IPS.entries()) {
      if (now < record.expiresAt) {
        active.push({ ip, reason: record.reason, expiresAt: record.expiresAt });
      } else {
        DYNAMIC_BANNED_IPS.delete(ip);
      }
    }

    return {
      staticBlockedCount: STATIC_BLOCKED_IPS.size,
      dynamicBannedCount: active.length,
      activeBans: active
    };
  }
}

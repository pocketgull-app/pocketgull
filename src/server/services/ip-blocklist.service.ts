// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

/**
 * 🛡️ PocketGull Zero-Cost IP Blocklist & Threat Auto-Ban Engine
 *
 * Provides:
 * 1. Zero-cloud-cost in-memory IP blocking for known abusive proxy/bot networks.
 * 2. Automatic dynamic 24-hour banning with bounded LRU cap (10,000 entries) to prevent OOM.
 * 3. Trust-proxy validated IP extraction (`req.ip` preferred; never trusts spoofable leftmost X-Forwarded-For).
 * 4. Immediate 403 Forbidden rejection preventing container cold-start exhaustion.
 */

export interface IBanRecord {
  bannedAt: number;
  expiresAt: number;
  reason: string;
}

export interface IRequestIpLike {
  ip?: string;
  headers?: Record<string, unknown>;
  socket?: { remoteAddress?: string };
}

// Pre-seeded static blocklist of known abusive scanner IPs (e.g. AS48090 proxy scanners)
export const STATIC_BLOCKED_IPS = new Set<string>([
  '93.123.109.152', // Flagged scanner: rapid-fire .git/config probe on 2026-10-08 (AS48090)
  ...(typeof process !== 'undefined' && process.env?.['BLOCKED_IPS']
    ? process.env['BLOCKED_IPS'].split(',').map(s => s.trim()).filter(Boolean)
    : [])
]);

// Dynamic in-memory ban map with TTL and strict LRU memory cap
export const DYNAMIC_BANNED_IPS = new Map<string, IBanRecord>();
export const DEFAULT_BAN_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_DYNAMIC_BANS = 10_000;

// Regex matching common web vulnerability scanners and automated exploit probes (linear-time, zero nested quantifiers)
export const MALICIOUS_PROBE_REGEX = /(?:^\/(?:wp-(?:admin|content|includes|login|config|cron|load)|phpmyadmin|pma|actuator|xmlrpc\.php|cgi-bin|\.aws|\.ssh)(?:[./]|$))|(?:\/(?:\.git|\.env|\.ds_store|\.bak|\.swp|\.sql|\.tar|\.zip)(?:[./]|$))/i;

function normalizeIp(raw: string): string {
  return raw.replace(/^::ffff:/, '').trim();
}

function isPrivateOrProxyIp(ip: string): boolean {
  const clean = normalizeIp(ip);
  if (!clean) return false;
  if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') return true;
  if (clean.startsWith('10.') || clean.startsWith('192.168.')) return true;
  const octets = clean.split('.');
  if (octets.length === 4 && octets[0] === '172') {
    const second = Number(octets[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

export class IpBlocklistService {
  /**
   * Returns true ONLY if the direct TCP socket peer address is loopback (cannot be spoofed via X-Forwarded-For).
   */
  static isDirectLoopback(socketAddress: string = ''): boolean {
    const clean = normalizeIp(socketAddress);
    return clean === '127.0.0.1' || clean === '::1' || clean === 'localhost';
  }

  /**
   * Extracts validated client IP.
   * Prefers Express's `trust proxy`-validated `req.ip`. When invoked with legacy `(headers, socketAddress)`,
   * never trusts spoofable leftmost `X-Forwarded-For` entries — only evaluates the rightmost client hop
   * appended by a trusted internal proxy socket and never allows spoofed `127.0.0.1` loopback bypass.
   */
  static extractClientIp(
    reqOrHeaders: IRequestIpLike | Record<string, unknown> = {},
    socketAddress: string = ''
  ): string {
    // Preferred path: Express Request with trust-proxy resolved req.ip
    if (
      reqOrHeaders &&
      typeof reqOrHeaders === 'object' &&
      'ip' in reqOrHeaders &&
      typeof (reqOrHeaders as IRequestIpLike).ip === 'string' &&
      (reqOrHeaders as IRequestIpLike).ip!.trim().length > 0
    ) {
      const reqIp = normalizeIp((reqOrHeaders as IRequestIpLike).ip!);
      const rawSock = normalizeIp((reqOrHeaders as IRequestIpLike).socket?.remoteAddress || socketAddress);
      // Never allow a proxied header to masquerade as loopback if the socket peer is not loopback/internal
      if (IpBlocklistService.isDirectLoopback(reqIp) && rawSock && !isPrivateOrProxyIp(rawSock)) {
        return rawSock;
      }
      return reqIp;
    }

    const sock = normalizeIp(
      (reqOrHeaders && typeof reqOrHeaders === 'object' && 'socket' in reqOrHeaders
        ? (reqOrHeaders as IRequestIpLike).socket?.remoteAddress
        : '') || socketAddress
    );

    const headers =
      reqOrHeaders && typeof reqOrHeaders === 'object' && 'headers' in reqOrHeaders && (reqOrHeaders as IRequestIpLike).headers
        ? (reqOrHeaders as IRequestIpLike).headers!
        : (reqOrHeaders as Record<string, unknown>);

    const xff = headers?.['x-forwarded-for'];
    // Only consider X-Forwarded-For when the direct peer socket is a trusted internal reverse proxy
    if (xff && sock && isPrivateOrProxyIp(sock)) {
      const hops = String(xff)
        .split(',')
        .map(h => normalizeIp(h))
        .filter(Boolean);

      // Scan from RIGHT to LEFT (nearest trusted proxy edge first) — prevents leftmost spoofing
      for (let i = hops.length - 1; i >= 0; i--) {
        const candidate = hops[i];
        if (!isPrivateOrProxyIp(candidate)) {
          return candidate;
        }
      }
    }

    return sock;
  }

  /**
   * Determines if a request path represents an automated exploit or vulnerability sweep.
   */
  static isMaliciousProbe(path: string): boolean {
    if (!path) return false;
    return MALICIOUS_PROBE_REGEX.test(path);
  }

  /**
   * Checks whether an IP address is blocked (either permanently or under active temporary ban).
   */
  static isBlocked(ip: string): boolean {
    if (!ip) return false;
    const cleanIp = normalizeIp(ip);

    if (STATIC_BLOCKED_IPS.has(cleanIp)) {
      return true;
    }

    const dynamicBan = DYNAMIC_BANNED_IPS.get(cleanIp);
    if (dynamicBan) {
      if (Date.now() < dynamicBan.expiresAt) {
        // Refresh LRU recency
        DYNAMIC_BANNED_IPS.delete(cleanIp);
        DYNAMIC_BANNED_IPS.set(cleanIp, dynamicBan);
        return true;
      }
      DYNAMIC_BANNED_IPS.delete(cleanIp);
    }

    return false;
  }

  /**
   * Dynamically bans an offending IP for a specified duration with strict LRU cap (`MAX_DYNAMIC_BANS`).
   */
  static banIp(ip: string, reason: string, durationMs: number = DEFAULT_BAN_DURATION_MS): void {
    if (!ip) return;
    const cleanIp = normalizeIp(ip);
    if (!cleanIp) return;

    const now = Date.now();
    // Refresh position if already present
    DYNAMIC_BANNED_IPS.delete(cleanIp);

    // Enforce bounded LRU ceiling to prevent unbounded memory growth under distributed scans
    if (DYNAMIC_BANNED_IPS.size >= MAX_DYNAMIC_BANS) {
      for (const [existingIp, record] of DYNAMIC_BANNED_IPS.entries()) {
        if (now >= record.expiresAt) {
          DYNAMIC_BANNED_IPS.delete(existingIp);
        }
        if (DYNAMIC_BANNED_IPS.size < MAX_DYNAMIC_BANS) break;
      }
      while (DYNAMIC_BANNED_IPS.size >= MAX_DYNAMIC_BANS) {
        const oldestKey = DYNAMIC_BANNED_IPS.keys().next().value;
        if (!oldestKey) break;
        DYNAMIC_BANNED_IPS.delete(oldestKey);
      }
    }

    DYNAMIC_BANNED_IPS.set(cleanIp, {
      bannedAt: now,
      expiresAt: now + durationMs,
      reason: String(reason || '').slice(0, 256)
    });
  }

  /**
   * Removes an IP from dynamic ban list.
   */
  static unbanIp(ip: string): boolean {
    const cleanIp = normalizeIp(ip);
    return DYNAMIC_BANNED_IPS.delete(cleanIp);
  }

  /**
   * Retrieves summary telemetry for active bans.
   */
  static getTelemetry(): {
    staticBlockedCount: number;
    dynamicBannedCount: number;
    maxDynamicCapacity: number;
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
      maxDynamicCapacity: MAX_DYNAMIC_BANS,
      activeBans: active
    };
  }
}

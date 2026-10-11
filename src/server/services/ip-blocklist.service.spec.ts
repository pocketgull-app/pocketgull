// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { describe, it, expect, beforeEach } from 'vitest';
import {
  IpBlocklistService,
  STATIC_BLOCKED_IPS,
  DYNAMIC_BANNED_IPS,
  MALICIOUS_PROBE_REGEX
} from './ip-blocklist.service';

describe('IpBlocklistService & Threat Mitigation Suite ($0.00 Cost)', () => {
  beforeEach(() => {
    DYNAMIC_BANNED_IPS.clear();
  });

  it('contains the known malicious scanner IP in the static blocklist', () => {
    expect(STATIC_BLOCKED_IPS.has('93.123.109.152')).toBe(true);
    expect(IpBlocklistService.isBlocked('93.123.109.152')).toBe(true);
    // Handles IPv6 mapped IPv4 format
    expect(IpBlocklistService.isBlocked('::ffff:93.123.109.152')).toBe(true);
  });

  it('allows legitimate clinical IP traffic by default', () => {
    expect(IpBlocklistService.isBlocked('198.51.100.42')).toBe(false);
    expect(IpBlocklistService.isBlocked('127.0.0.1')).toBe(false);
  });

  it('accurately identifies automated vulnerability sweeps and exploit paths', () => {
    expect(IpBlocklistService.isMaliciousProbe('/.git/config')).toBe(true);
    expect(IpBlocklistService.isMaliciousProbe('/wp-content/.git/config')).toBe(true);
    expect(IpBlocklistService.isMaliciousProbe('/api/.git/config')).toBe(true);
    expect(IpBlocklistService.isMaliciousProbe('/.env')).toBe(true);
    expect(IpBlocklistService.isMaliciousProbe('/wp-login.php')).toBe(true);
    expect(IpBlocklistService.isMaliciousProbe('/phpmyadmin/index.php')).toBe(true);
    expect(IpBlocklistService.isMaliciousProbe('/actuator/health')).toBe(true);

    // Legitimate paths must NEVER be flagged
    expect(IpBlocklistService.isMaliciousProbe('/')).toBe(false);
    expect(IpBlocklistService.isMaliciousProbe('/health')).toBe(false);
    expect(IpBlocklistService.isMaliciousProbe('/api/patients')).toBe(false);
    expect(IpBlocklistService.isMaliciousProbe('/case-studies/cardiometabolic')).toBe(false);
    expect(IpBlocklistService.isMaliciousProbe('/.well-known/acme-challenge/token123')).toBe(false);
  });

  it('dynamically auto-bans an IP upon exploit attempt and enforces TTL', () => {
    const attackerIp = '198.51.100.99';
    expect(IpBlocklistService.isBlocked(attackerIp)).toBe(false);

    // Auto-ban attacker for 1000ms in test
    IpBlocklistService.banIp(attackerIp, '/.git/config', 1000);
    expect(IpBlocklistService.isBlocked(attackerIp)).toBe(true);

    // Verify unban capability
    expect(IpBlocklistService.unbanIp(attackerIp)).toBe(true);
    expect(IpBlocklistService.isBlocked(attackerIp)).toBe(false);
  });

  it('correctly extracts client IP across single-hop reverse proxy headers', () => {
    const mockHeaders = {
      'x-forwarded-for': '203.0.113.195, 10.0.0.1'
    };
    const ip = IpBlocklistService.extractClientIp(mockHeaders, '10.0.0.1');
    expect(ip).toBe('203.0.113.195');
  });

  it('provides accurate telemetry for active bans', () => {
    IpBlocklistService.banIp('198.51.100.101', 'exploit_probe');
    IpBlocklistService.banIp('198.51.100.102', 'exploit_probe');

    const telemetry = IpBlocklistService.getTelemetry();
    expect(telemetry.staticBlockedCount).toBeGreaterThanOrEqual(1);
    expect(telemetry.dynamicBannedCount).toBe(2);
    expect(telemetry.activeBans.map(b => b.ip)).toContain('198.51.100.101');
  });
});

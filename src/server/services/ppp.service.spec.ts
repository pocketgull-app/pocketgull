import { describe, it, expect } from 'vitest';
import { pppPricingService } from './ppp.service';

describe('PppPricingService', () => {
  it('should return Tier 1 (1.0x, 0% discount) for US, GB, CA, and defaults', () => {
    const us = pppPricingService.resolvePppInfo('US');
    expect(us.tier).toBe(1);
    expect(us.multiplier).toBe(1.0);
    expect(us.discountPercent).toBe(0);

    const gb = pppPricingService.resolvePppInfo('GB');
    expect(gb.tier).toBe(1);

    const defaultInfo = pppPricingService.resolvePppInfo();
    expect(defaultInfo.tier).toBe(1);
  });

  it('should return Tier 2 (0.65x, 35% discount) for MX, ZA, PL', () => {
    const mx = pppPricingService.resolvePppInfo('MX');
    expect(mx.tier).toBe(2);
    expect(mx.multiplier).toBe(0.65);
    expect(mx.discountPercent).toBe(35);
    expect(mx.countryName).toBe('Mexico');

    const za = pppPricingService.resolvePppInfo('za'); // Case-insensitivity
    expect(za.tier).toBe(2);
  });

  it('should return Tier 3 (0.40x, 60% discount) for BR, CO, TR, PH', () => {
    const br = pppPricingService.resolvePppInfo('BR');
    expect(br.tier).toBe(3);
    expect(br.multiplier).toBe(0.40);
    expect(br.discountPercent).toBe(60);

    const ph = pppPricingService.resolvePppInfo('PH');
    expect(ph.tier).toBe(3);
    expect(ph.countryName).toBe('Philippines');
  });

  it('should return Tier 4 (0.25x, 75% discount) for IN, PK, NG, KE, GH', () => {
    const india = pppPricingService.resolvePppInfo('IN');
    expect(india.tier).toBe(4);
    expect(india.multiplier).toBe(0.25);
    expect(india.discountPercent).toBe(75);
    expect(india.countryName).toBe('India');

    const nigeria = pppPricingService.resolvePppInfo('NG');
    expect(nigeria.tier).toBe(4);
  });

  it('should correctly calculate adjusted cents for a $49.00 subscription', () => {
    // Base $49.00 = 4900 cents
    // India (75% off): 4900 * 0.25 = 1225 cents ($12.25)
    const inRes = pppPricingService.calculateAdjustedAmountCents(4900, 'IN');
    expect(inRes.finalAmountCents).toBe(1225);
    expect(inRes.pppInfo.tier).toBe(4);

    // Brazil (60% off): 4900 * 0.40 = 1960 cents ($19.60)
    const brRes = pppPricingService.calculateAdjustedAmountCents(4900, 'BR');
    expect(brRes.finalAmountCents).toBe(1960);

    // US (0% off): 4900 cents ($49.00)
    const usRes = pppPricingService.calculateAdjustedAmountCents(4900, 'US');
    expect(usRes.finalAmountCents).toBe(4900);
  });

  it('should correctly calculate adjusted cents for a $299.00 Lifetime Founder License', () => {
    // Base $299.00 = 29900 cents
    // India (75% off): 29900 * 0.25 = 7475 cents ($74.75)
    const inRes = pppPricingService.calculateAdjustedAmountCents(29900, 'IN');
    expect(inRes.finalAmountCents).toBe(7475);

    // Mexico (35% off): 29900 * 0.65 = 19435 cents ($194.35)
    const mxRes = pppPricingService.calculateAdjustedAmountCents(29900, 'MX');
    expect(mxRes.finalAmountCents).toBe(19435);
  });

  it('should enforce safety minimum floor of $5.00 (500 cents)', () => {
    const cheapRes = pppPricingService.calculateAdjustedAmountCents(1200, 'IN'); // $12 base * 0.25 = $3 -> floor $5
    expect(cheapRes.finalAmountCents).toBe(500);
  });
});

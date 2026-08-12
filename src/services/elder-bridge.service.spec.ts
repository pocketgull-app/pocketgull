import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { ElderBridgeService } from './elder-bridge.service';

describe('ElderBridgeService (Elder Care & Intergenerational Companionship)', () => {
  let service: ElderBridgeService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [ElderBridgeService]
    });
    service = runInInjectionContext(injector, () => injector.get(ElderBridgeService));
  });

  it('1. Initializes default elder care programs and total seniors served', () => {
    const programs = service.programs();
    expect(programs.length).toBe(3);
    expect(service.totalSeniorsServed()).toBeGreaterThan(2000);
  });

  it('2. Computes average balance stability score across senior profiles', () => {
    expect(service.seniors().length).toBe(2);
    expect(service.averageBalanceScore()).toBeGreaterThan(80);
  });
});

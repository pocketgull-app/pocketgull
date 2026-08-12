import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { LegacySwarmAgentsService } from './legacy-swarm-agents.service';
import { GrowThyselfLegacyEngineService } from '../grow-thyself-legacy-engine.service';
import { PatientStateService } from '../patient-state.service';
import { StorageService } from '../storage.service';
import { ThemeService } from '../theme.service';
import { ActuarialLongevityService } from '../actuarial-longevity.service';
import { GamificationService } from '../gamification.service';

describe('LegacySwarmAgentsService (New AI Agent Types)', () => {
  let service: LegacySwarmAgentsService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        ThemeService,
        StorageService,
        GamificationService,
        ActuarialLongevityService,
        PatientStateService,
        GrowThyselfLegacyEngineService,
        LegacySwarmAgentsService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(LegacySwarmAgentsService));
  });

  it('1. Initializes 3 new types of AI Agents (Chronos, Sentinel, Aeneas)', () => {
    expect(service.activeAgentsCount()).toBe(3);
    expect(service.agentMessages().length).toBe(3);
    expect(service.agentMessages().some(m => m.agentType === 'CHRONOS_BIOGRAPHER')).toBe(true);
    expect(service.agentMessages().some(m => m.agentType === 'AENEAS_LEGACY_STEWARD')).toBe(true);
    expect(service.agentMessages().some(m => m.agentType === 'SENTINEL_RESEARCH_SWARM')).toBe(true);
  });

  it('2. Triggers Chronos Socratic interview prompt', () => {
    const msg = service.triggerChronosInterview();
    expect(msg.agentType).toBe('CHRONOS_BIOGRAPHER');
    expect(service.agentMessages()[0].id).toBe(msg.id);
  });
});

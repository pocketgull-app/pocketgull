import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { ImpactChannelsLinkingCardComponent } from './impact-channels-linking-card.component';
import { ImpactPartnerChannelsService } from '../services/impact-partner-channels.service';

describe('ImpactChannelsLinkingCardComponent', () => {
  let component: ImpactChannelsLinkingCardComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        ImpactPartnerChannelsService,
        ImpactChannelsLinkingCardComponent
      ]
    });
    component = runInInjectionContext(injector, () => injector.get(ImpactChannelsLinkingCardComponent));
  });

  it('1. Initializes Impact channels linking component with platform options', () => {
    expect(component.platforms.length).toBe(6);
    expect(component.channelsService.connectedChannels().length).toBeGreaterThan(0);
  });
});

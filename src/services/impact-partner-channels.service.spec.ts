import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { ImpactPartnerChannelsService } from './impact-partner-channels.service';

describe('ImpactPartnerChannelsService (Impact.com Media Partner Channels)', () => {
  let service: ImpactPartnerChannelsService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        ImpactPartnerChannelsService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(ImpactPartnerChannelsService));
  });

  it('1. Initializes connected channels for Impact.com partner verification', () => {
    expect(service.connectedChannels().length).toBe(3);
    expect(service.totalVerifiedChannelsCount()).toBe(3);
  });

  it('2. Supports adding Instagram and TikTok channels for instant brand approval', () => {
    service.addChannel('INSTAGRAM', 'Pocketgull Instagram', 'https://instagram.com/pocketgull', 25000);
    expect(service.connectedChannels().length).toBe(4);
  });
});

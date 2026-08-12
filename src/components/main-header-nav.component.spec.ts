import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { MainHeaderNavComponent } from './main-header-nav.component';
import { NetworkStateService } from '../services/network-state.service';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';
import { HardwareTelemetryService } from '../services/hardware/hardware-telemetry.service';
import { GamificationService } from '../services/gamification.service';
import { WalkthroughTourService } from '../services/walkthrough-tour.service';

describe('MainHeaderNavComponent', () => {
  let component: MainHeaderNavComponent;
  let mockNetwork: any;
  let mockPatientState: any;
  let mockTheme: any;
  let mockHardware: any;
  let mockGame: any;
  let mockTour: any;

  beforeEach(() => {
    mockNetwork = { isOnline: signal(true) };
    mockPatientState = { isEmergencyMode: signal(false) };
    mockTheme = {
      currentTheme: signal('light'),
      textSizeScale: signal('standard'),
      cycleTheme: vi.fn(),
      cycleTextSizeScale: vi.fn()
    };
    mockHardware = { companionConnected: signal(false) };
    mockGame = {
      levelTitle: signal('Attending'),
      level: signal(5),
      points: signal(1250),
      progressPercentage: signal(75)
    };
    mockTour = { forceStart: vi.fn() };

    const injector = Injector.create({
      providers: [
        { provide: NetworkStateService, useValue: mockNetwork },
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: ThemeService, useValue: mockTheme },
        { provide: HardwareTelemetryService, useValue: mockHardware },
        { provide: GamificationService, useValue: mockGame },
        { provide: WalkthroughTourService, useValue: mockTour }
      ]
    });

    component = runInInjectionContext(injector, () => new MainHeaderNavComponent());
  });

  it('should initialize component instance and injected services', () => {
    expect(component).toBeTruthy();
    expect(component.game.levelTitle()).toBe('Attending');
    expect(component.game.points()).toBe(1250);
  });

  it('should expose date and output emitters', () => {
    expect(component.today).toBeInstanceOf(Date);
    expect(component.openCompanionSync).toBeTruthy();
    expect(component.triggerSomaticGrounding).toBeTruthy();
  });
});

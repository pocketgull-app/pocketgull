import { Injector, runInInjectionContext, signal } from '@angular/core';
import { MainHeaderNavComponent } from './main-header-nav.component';
import { NetworkStateService } from '../services/network-state.service';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';
import { HardwareTelemetryService } from '../services/hardware/hardware-telemetry.service';
import { GamificationService } from '../services/gamification.service';
import { WalkthroughTourService } from '../services/walkthrough-tour.service';

import { SessionStateService } from '../services/session-state.service';
import { AmbientFlowSoundscapeService } from '../services/ambient-flow-soundscape.service';

describe('MainHeaderNavComponent', () => {
  let component: MainHeaderNavComponent;
  let mockNetwork: any;
  let mockPatientState: any;
  let mockTheme: any;
  let mockHardware: any;
  let mockGame: any;
  let mockTour: any;
  let mockSession: any;
  let mockSoundscape: any;

  beforeEach(() => {
    mockNetwork = { isOnline: signal(true), toggleForceOffline: vi.fn() };
    mockPatientState = { isEmergencyMode: signal(false), isLiveAgentActive: signal(false), toggleLiveAgent: vi.fn() };
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
    mockSession = { lock: vi.fn(), isLocked: signal(false) };
    mockSoundscape = {
      isPlaying: signal(false),
      togglePlay: vi.fn(),
      setSoundscape: vi.fn(),
      setVolume: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: NetworkStateService, useValue: mockNetwork },
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: ThemeService, useValue: mockTheme },
        { provide: HardwareTelemetryService, useValue: mockHardware },
        { provide: GamificationService, useValue: mockGame },
        { provide: WalkthroughTourService, useValue: mockTour },
        { provide: SessionStateService, useValue: mockSession },
        { provide: AmbientFlowSoundscapeService, useValue: mockSoundscape }
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
    expect(component.openEncryptedVault).toBeTruthy();
    expect(component.openSmartFhirSync).toBeTruthy();
    expect(component.openGlobalHealth).toBeTruthy();
    expect(component.triggerSomaticGrounding).toBeTruthy();
  });

  it('should toggle mobile menu drawer state correctly for Fitts Law accessibility', () => {
    expect(component.isMobileMenuOpen()).toBe(false);
    component.isMobileMenuOpen.set(true);
    expect(component.isMobileMenuOpen()).toBe(true);
    component.isMobileMenuOpen.set(false);
    expect(component.isMobileMenuOpen()).toBe(false);
  });
});


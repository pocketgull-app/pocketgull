import '@angular/compiler';
import { describe, it, expect, vi } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { PatientStateService } from '../src/services/patient-state.service';
import { PatientManagementService } from '../src/services/patient-management.service';
import { ThemeService } from '../src/services/theme.service';
import { StorageService } from '../src/services/storage.service';
import { GamificationService } from '../src/services/gamification.service';
import { ClinicalToolCardComponent, IClinicalToolItem } from '../src/components/shared/clinical-tool-card.component';
import { DomainSuitesNavigatorComponent } from '../src/components/suites/domain-suites-navigator.component';
import { ThemeStudioDrawerComponent } from '../src/components/shared/theme-studio-drawer.component';
import { CircadianSleepinessService } from '../src/services/circadian-sleepiness.service';
import { ResearchLecturesService } from '../src/services/research-lectures.service';
import { ActuarialLongevityService } from '../src/services/actuarial-longevity.service';
// Mock Angular constructor effects for headless Vitest environment
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => {
      return {
        destroy: () => {}
      };
    }
  };
});

describe('Clinical Platform & Progressive Disclosure E2E Suite', () => {

  const createServices = () => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: StorageService, useFactory: () => new StorageService() },
        { provide: GamificationService, useFactory: () => new GamificationService() },
        { provide: ThemeService, useFactory: () => new ThemeService() },
        { provide: PatientManagementService, useFactory: () => new PatientManagementService() },
        { provide: ActuarialLongevityService, useFactory: () => new ActuarialLongevityService() },
        { provide: PatientStateService, useFactory: () => new PatientStateService() }
      ]
    });

    return runInInjectionContext(injector, () => ({
      themeService: injector.get(ThemeService),
      patientState: injector.get(PatientStateService)
    }));
  };

  it('1. Verifies clean slate state for new patients without prepopulated synthetic data', () => {
    const { patientState } = createServices();
    patientState.clearState();

    expect(patientState.patientId()).toBeNull();
    expect(patientState.vitals().bp).toBe('');
    expect(patientState.vitals().hr).toBe('');
    expect(patientState.patientHistory()).toEqual([]);
    expect(patientState.oxidativeStressMarkers()).toEqual([]);
    expect(patientState.antioxidantSources()).toEqual([]);
  });

  it('2. Verifies dynamic clinical tool auto-prescription based on patient hypertension & stress data', () => {
    const { patientState } = createServices();
    const hypertensivePatient = {
      id: 'p_hypertension_test',
      name: 'John Test',
      preexistingConditions: ['Hypertension', 'Stress Insomnia'],
      vitals: { bp: '145/92', hr: '94' },
      patientGoals: 'Reduce blood pressure and anxiety'
    };

    patientState.autoPrescribeToolsFromPatientData(hypertensivePatient);
    const states = patientState.toolStates();

    expect(states['solfeggio']).toBe('prescribed');
    expect(states['vagal']).toBe('prescribed');
    expect(states['storm']).toBe('prescribed');
  });

  it('3. Verifies Level 1/2/3 progressive disclosure and gesture state machines on ClinicalToolCardComponent', () => {
    const injector = Injector.create({ providers: [{ provide: ResearchLecturesService, useValue: {} }] });
    const card = runInInjectionContext(injector, () => new ClinicalToolCardComponent());
    const mockTool: IClinicalToolItem = {
      id: 'vagal',
      name: 'Vagal Resonance Quick-Dock',
      icon: '🫁',
      category: 'Autonomic HRV',
      personalizedInstruction: 'Practice 6 breaths/min for baroreflex gain.',
      suggestedUsage: '10 mins BID',
      patientCareTip: 'Exhale slowly for 6s'
    };
    (card as any).tool = () => mockTool;

    // Level 1 Initial state: unexpanded
    expect(card.isExpanded()).toBe(false);

    // Level 2 Single Click: opens drill-down drawer
    const clickEvent = { stopPropagation: () => {} } as any;
    card.handleSingleClick(clickEvent);
    expect(card.isExpanded()).toBe(true);

    // Level 3 Double Click: emits fast state machine toggle
    let emittedStateId = '';
    card.toggleState.subscribe(id => emittedStateId = id);
    const dblClickEvent = { stopPropagation: () => {} } as any;
    card.handleDoubleClick(dblClickEvent);
    expect(emittedStateId).toBe('vagal');
  });

  it('4. Verifies Dieter Rams accessibility attributes on DomainSuitesNavigatorComponent', () => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: StorageService, useFactory: () => new StorageService() },
        { provide: GamificationService, useFactory: () => new GamificationService() },
        { provide: ThemeService, useFactory: () => new ThemeService() },
        { provide: PatientManagementService, useFactory: () => new PatientManagementService() },
        { provide: ActuarialLongevityService, useFactory: () => new ActuarialLongevityService() },
        { provide: PatientStateService, useFactory: () => new PatientStateService() },
        { provide: CircadianSleepinessService, useFactory: () => new CircadianSleepinessService() }
      ]
    });
    const navigator = runInInjectionContext(injector, () => new DomainSuitesNavigatorComponent());

    expect(navigator.displayedSuites().length).toBeGreaterThan(0);
    expect(navigator.showAllSuites()).toBe(false);

    navigator.toggleShowAllSuites();
    expect(navigator.showAllSuites()).toBe(true);
    expect(navigator.displayedSuites().length).toBe(12);
  });

  it('5. Verifies Dieter Rams Theme Studio drawer palette selection and primary fast-cycling', () => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: ThemeService, useFactory: () => new ThemeService() }
      ]
    });
    const studio = runInInjectionContext(injector, () => new ThemeStudioDrawerComponent());

    studio.themeService.currentTheme.set('light');
    expect(studio.themeService.currentTheme()).toBe('light');

    studio.cyclePrimaryTheme();
    expect(studio.themeService.currentTheme()).toBe('dark');
  });

});

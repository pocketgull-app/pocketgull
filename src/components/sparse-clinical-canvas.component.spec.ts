import '@angular/compiler';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SparseClinicalCanvasComponent } from './sparse-clinical-canvas.component';
import { ClinicalMoERouterService } from '../services/clinical-moe-router.service';
import { PatientStateService } from '../services/patient-state.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('SparseClinicalCanvasComponent Unit Suite', () => {
  let component: SparseClinicalCanvasComponent;
  let moeRouter: ClinicalMoERouterService;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SparseClinicalCanvasComponent],
      providers: [
        ClinicalMoERouterService,
        PatientStateService,
        { provide: PLATFORM_ID, useValue: 'server' },
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock clinical synthesis')
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SparseClinicalCanvasComponent);
    component = fixture.componentInstance;
    moeRouter = TestBed.inject(ClinicalMoERouterService);
    patientState = TestBed.inject(PatientStateService);
  });

  afterEach(() => {
    moeRouter.clearOverrides();
  });

  it('1. Instantiates successfully with active primary expert and shift roster', () => {
    expect(component).toBeTruthy();
    expect(component.shiftRoster.length).toBeGreaterThan(0);
    expect(component.primaryExpert()).toBeDefined();
    expect(component.latentExperts().length).toBeGreaterThan(0);
  });

  it('2. Computes flex styles based on Top-k value and secondary expert', () => {
    moeRouter.setKValue(1);
    expect(component.primaryStyleFlex()).toBe('1 1 100%');

    moeRouter.setKValue(2);
    if (component.secondaryExpert()) {
      expect(component.primaryStyleFlex()).toContain('%');
      expect(component.secondaryStyleFlex()).toContain('%');
    }
  });

  it('3. Selects a shift patient from roster', () => {
    const firstPatient = component.shiftRoster[0];
    const event = {
      target: { value: firstPatient.id }
    } as unknown as Event;

    component.onSelectShiftPatient(event);
    expect(moeRouter.activeShiftPatientId()).toBe(firstPatient.id);
  });

  it('4. Clears overrides when empty patient is selected', () => {
    const clearSpy = vi.spyOn(moeRouter, 'clearOverrides');
    const event = {
      target: { value: '' }
    } as unknown as Event;

    component.onSelectShiftPatient(event);
    expect(clearSpy).toHaveBeenCalled();
  });

  it('5. Promotes latent expert into active primary slot', () => {
    const latentList = component.latentExperts();
    if (latentList.length > 0) {
      const targetId = latentList[0].expert.id;
      moeRouter.promoteLatentExpert(targetId);
      expect(moeRouter.pinnedExpertId()).toBe(targetId);
      expect(component.primaryExpert()?.expert.id).toBe(targetId);
    }
  });

  it('6. Triggers askAiToExplainFlow and sets patient state prompt', () => {
    component.showDecisionFlowExplorer.set(true);
    component.askAiToExplainFlow('sc01');

    expect(component.showDecisionFlowExplorer()).toBe(false);
    expect(patientState.isLiveAgentActive()).toBe(true);
    expect(patientState.liveAgentInput()).toContain('sc01');
  });
});

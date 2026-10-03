import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Holographic3DAnatomyComponent } from './holographic-3d-anatomy.component';
import { ThemeService } from '../../services/theme.service';
import { PatientStateService } from '../../services/patient-state.service';

describe('Holographic3DAnatomyComponent Unit Suite', () => {
  let component: Holographic3DAnatomyComponent;

  beforeEach(async () => {
    const mockTheme = {
      currentTheme: signal('dark'),
      isPlainLanguageMode: signal(false)
    };

    const mockState = {
      vitals: signal({ hrv: '78', hr: '68' })
    };

    await TestBed.configureTestingModule({
      imports: [Holographic3DAnatomyComponent],
      providers: [
        { provide: ThemeService, useValue: mockTheme },
        { provide: PatientStateService, useValue: mockState }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(Holographic3DAnatomyComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with western lens and vagal active by default', () => {
    expect(component).toBeTruthy();
    expect(component.activeLens()).toBe('western');
    expect(component.isAnsVagalActive()).toBe(true);
    expect(component.isDentalArchActive()).toBe(true);
    expect(component.isAutoSpinning()).toBe(false);
  });

  it('2. Computes HRV from patient state vitals', () => {
    expect(component.currentHrv()).toBe(78);
  });

  it('3. Toggles spatial lenses (western, tcm, ayurveda, unified)', () => {
    component.activeLens.set('tcm');
    expect(component.activeLens()).toBe('tcm');

    component.activeLens.set('ayurveda');
    expect(component.activeLens()).toBe('ayurveda');

    component.activeLens.set('unified');
    expect(component.activeLens()).toBe('unified');
  });

  it('4. Toggles autonomic nervous system (vagal) visualization', () => {
    component.isAnsVagalActive.set(false);
    expect(component.isAnsVagalActive()).toBe(false);
    component.isAnsVagalActive.set(true);
    expect(component.isAnsVagalActive()).toBe(true);
  });

  it('5. Manages selected tooth details for systemic teledentistry lens', () => {
    expect(component.selectedTooth()).toBeNull();
    component.selectedTooth.set({
      fdiCode: 16,
      name: 'Maxillary Right First Molar',
      ppd: 5,
      bop: true,
      wearGrade: 2,
      sibiScore: 4.2,
      cvRiskMultiplier: '1.4x',
      hba1cIncrease: '+0.3%'
    });
    expect(component.selectedTooth()?.fdiCode).toBe(16);
    expect(component.selectedTooth()?.cvRiskMultiplier).toBe('1.4x');
  });
});

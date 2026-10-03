import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SystemsEquilibriumHudComponent, SystemsNavMode } from './systems-equilibrium-hud.component';
import { PatientStateService } from '../../services/patient-state.service';
import { ClinicalIntelligenceService } from '../../services/clinical-intelligence.service';
import { PharmacogenomicsService } from '../../services/pharmacogenomics.service';

describe('SystemsEquilibriumHudComponent', () => {
  let component: SystemsEquilibriumHudComponent;
  let fixture: ComponentFixture<SystemsEquilibriumHudComponent>;
  let mockPatientState: {
    vitals: ReturnType<typeof signal<{ hr: string; bp: string; spO2: string }>>;
    issues: ReturnType<typeof signal<Record<string, unknown>>>;
    isEmergencyMode: ReturnType<typeof signal<boolean>>;
  };
  let mockIntel: {
    analysisMetrics: ReturnType<typeof signal<{ complexity: number } | null>>;
  };
  let mockPgx: {
    activeProfile: ReturnType<typeof signal<any>>;
  };

  beforeEach(async () => {
    mockPatientState = {
      vitals: signal({ hr: '68', bp: '122/82', spO2: '99%' }),
      issues: signal<Record<string, unknown>>({ knee_pain: {}, fatigue: {} }),
      isEmergencyMode: signal(false)
    };

    mockIntel = {
      analysisMetrics: signal<{ complexity: number } | null>({ complexity: 4 })
    };

    mockPgx = {
      activeProfile: signal<any>({
        variants: [{ gene: 'CYP2C19', diplotype: '*1/*2' }]
      })
    };

    await TestBed.configureTestingModule({
      imports: [SystemsEquilibriumHudComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: ClinicalIntelligenceService, useValue: mockIntel },
        { provide: PharmacogenomicsService, useValue: mockPgx }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SystemsEquilibriumHudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component with initial overview mode', () => {
    expect(component).toBeTruthy();
    expect(component.activeMode()).toBe('overview');
    expect(component.hrValue()).toBe(68);
    expect(component.bpValue()).toBe('122/82');
    expect(component.issuesCount()).toBe(2);
    expect(component.pgxProfile()).toBe('CYP2C19 *1/*2');
  });

  it('should render header with title and Homeostatic Equilibrium badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Macro Systems Equilibrium');
    expect(compiled.textContent).toContain('Homeostatic Equilibrium');
    expect(compiled.textContent).toContain('Donella Meadows Multi-Loop Feedback');
  });

  it('should render all 4 mode switcher buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Systems');
    expect(compiled.textContent).toContain('Cross-Talk');
    expect(compiled.textContent).toContain('Edge AI');
    expect(compiled.textContent).toContain('Tools');
  });

  it('should switch mode and emit modeChange output on selectMode', () => {
    let emittedMode: SystemsNavMode | undefined;
    component.modeChange.subscribe((m) => {
      emittedMode = m;
    });

    component.selectMode('crosstalk');
    expect(component.activeMode()).toBe('crosstalk');
    expect(emittedMode).toBe('crosstalk');

    component.selectMode('gemma');
    expect(component.activeMode()).toBe('gemma');
    expect(emittedMode).toBe('gemma');
  });

  it('should compute and display biophysical stocks and flows gauges', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Autonomic Tone');
    expect(compiled.textContent).toContain('68 bpm');
    expect(compiled.textContent).toContain('Metabolic Reserve');
    expect(compiled.textContent).toContain('BP 122/82');
    expect(compiled.textContent).toContain('Inflammatory Burden');
    expect(compiled.textContent).toContain('Active Issues (2)');
    expect(compiled.textContent).toContain('PGx CYP2C19 *1/*2');
  });

  it('should update acuity status to STAT Emergency when emergency mode is active', () => {
    mockPatientState.isEmergencyMode.set(true);
    fixture.detectChanges();

    expect(component.acuityStatus()).toBe('STAT Emergency');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('STAT Emergency');
  });

  it('should update acuity status to High Complexity when complexity metric > 7', () => {
    mockIntel.analysisMetrics.set({ complexity: 9 });
    fixture.detectChanges();

    expect(component.acuityStatus()).toBe('High Complexity');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('High Complexity');
  });
});

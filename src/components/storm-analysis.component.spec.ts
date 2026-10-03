import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { StormAnalysisComponent } from './storm-analysis.component';
import { PatientStateService } from '../services/patient-state.service';

describe('StormAnalysisComponent', () => {
  let component: StormAnalysisComponent;
  let fixture: ComponentFixture<StormAnalysisComponent>;
  let activePhilosophySignal: ReturnType<typeof signal<string>>;

  beforeEach(async () => {
    activePhilosophySignal = signal<string>('western');

    await TestBed.configureTestingModule({
      imports: [StormAnalysisComponent],
      providers: [
        {
          provide: PatientStateService,
          useValue: {
            activePhilosophy: activePhilosophySignal
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StormAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component with initial cytokine storm selected', () => {
    expect(component).toBeTruthy();
    expect(component.selectedStormId()).toBe('cytokine');
    expect(component.overallStormIndex()).toBe(3);
    expect(component.stormStatusText()).toBe('Stable Physiological Baseline');
  });

  it('should render header with badge and storm risk index', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Acute Multi-System Telemetry');
    expect(compiled.textContent).toContain('Gulliver 🔭 Dispatch');
    expect(compiled.textContent).toContain('Physiological & Environmental Storm Shield');
    expect(compiled.textContent).toContain('Storm Risk Index: 3/10 — Stable Physiological Baseline');
  });

  it('should render all 4 storm type selectors with severity scores', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Cytokine Inflammatory');
    expect(compiled.textContent).toContain('Sympathetic Adrenergic');
    expect(compiled.textContent).toContain('Hyper-Metabolic Heat');
    expect(compiled.textContent).toContain('Barometric Pressure');
  });

  it('should switch active storm when selectedStormId is changed', () => {
    component.selectedStormId.set('sympathetic');
    fixture.detectChanges();

    expect(component.activeStorm().name).toBe('Sympathetic Adrenergic');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Sympathetic Adrenergic Paradigm Evaluation');
    expect(compiled.textContent).toContain('Elevated baseline cortisol');
    expect(compiled.textContent).toContain('Magnesium L-Threonate');
  });

  it('should highlight active philosophy lens based on PatientStateService', () => {
    activePhilosophySignal.set('eastern');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Active Paradigm Lens: EASTERN');

    activePhilosophySignal.set('ayurvedic');
    fixture.detectChanges();
    expect(compiled.textContent).toContain('Active Paradigm Lens: AYURVEDIC');
  });

  it('should render calming actions protocol for the active storm profile', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Prescribed Storm De-escalation & Calming Protocol');
    expect(compiled.textContent).toContain('High-dose Curcumin & Boswellia phytotherapy');
    expect(compiled.textContent).toContain('Vagal resonant 0.1 Hz slow deep breathing');
  });
});

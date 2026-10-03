import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MyChartBriefModalComponent } from './mychart-brief-modal.component';
import { PatientStateService } from '../../services/patient-state.service';
import { ClinicalIntelligenceService } from '../../services/clinical-intelligence.service';
import { ActuarialLongevityService } from '../../services/actuarial-longevity.service';
import { ExportService } from '../../services/export.service';

describe('MyChartBriefModalComponent', () => {
  let component: MyChartBriefModalComponent;
  let fixture: ComponentFixture<MyChartBriefModalComponent>;
  let mockExportService: { exportPdfReport: ReturnType<typeof vi.fn> };
  let mockActuarialService: { calculateActuarialProfile: ReturnType<typeof vi.fn> };
  let mockPatientState: {
    patientName: ReturnType<typeof signal<string>>;
    vitals: ReturnType<typeof signal<{ hr: string; bp: string; spO2: string }>>;
  };

  beforeEach(async () => {
    mockPatientState = {
      patientName: signal('John Doe (Cardiometabolic Risk, 52y)'),
      vitals: signal({ hr: '74', bp: '128/84', spO2: '98%' })
    };

    mockActuarialService = {
      calculateActuarialProfile: vi.fn().mockReturnValue({
        biologicalAge: 48,
        biologicalAgeDelta: -4,
        projectedQalyGain: 3.8
      })
    };

    mockExportService = {
      exportPdfReport: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MyChartBriefModalComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: ClinicalIntelligenceService, useValue: { generateContent: vi.fn() } },
        { provide: ActuarialLongevityService, useValue: mockActuarialService },
        { provide: ExportService, useValue: mockExportService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyChartBriefModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component with initial actuarial profile and labs', () => {
    expect(component).toBeTruthy();
    expect(component.actuarialProfile().biologicalAge).toBe(48);
    expect(component.labs().length).toBe(6);
    expect(component.selectedCount()).toBe(5);
  });

  it('should render header with title and subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Epic MyChart Physician Visit Brief & Lab Navigator');
    expect(compiled.textContent).toContain('Empower your PCP visit with 3-paradigm pre-briefs');
  });

  it('should render consultation brief card with patient vitals and longevity delta', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('1-Page PCP Consultation Brief');
    expect(compiled.textContent).toContain('John Doe');
    expect(compiled.textContent).toContain('BP: 128/84 | HR: 74 bpm | SpO2: 98%');
    expect(compiled.textContent).toContain('Biological Age: 48');
    expect(compiled.textContent).toContain('+3.8 QALYs');
    expect(compiled.textContent).toContain('Top Clinical Priorities for PCP Discussion');
    expect(compiled.textContent).toContain('Western Clinical');
    expect(compiled.textContent).toContain('Eastern TCM Meridian');
    expect(compiled.textContent).toContain('Ayurvedic Constitution');
  });

  it('should render longevity lab request checklist with descriptions', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Targeted Longevity Lab Request Checklist');
    expect(compiled.textContent).toContain('ApoB (Apolipoprotein B)');
    expect(compiled.textContent).toContain('Fasting Insulin');
    expect(compiled.textContent).toContain('High-Sensitivity CRP (hs-CRP)');
    expect(compiled.textContent).toContain('Homocysteine');
    expect(compiled.textContent).toContain('Serum 25-OH Vitamin D3');
    expect(compiled.textContent).toContain('RBC Magnesium');
    expect(compiled.textContent).toContain('5 Selected');
  });

  it('should toggle lab item selection and update selected count', () => {
    // Toggle rbc_magnesium from false to true
    component.toggleLab('rbc_magnesium');
    fixture.detectChanges();
    expect(component.selectedCount()).toBe(6);
    expect(fixture.nativeElement.textContent).toContain('6 Selected');

    // Toggle apob from true to false
    component.toggleLab('apob');
    fixture.detectChanges();
    expect(component.selectedCount()).toBe(5);
  });

  it('should emit closeModal output when close action is triggered', () => {
    let closed = false;
    component.closeModal.subscribe(() => {
      closed = true;
    });

    component.closeModal.emit();
    expect(closed).toBe(true);
  });

  it('should format brief and export PDF via ExportService', () => {
    component.exportForMyChart();

    expect(mockExportService.exportPdfReport).toHaveBeenCalled();
    const [content, filename] = mockExportService.exportPdfReport.mock.calls[0];
    expect(content).toContain('# Epic MyChart Physician Consultation Brief');
    expect(content).toContain('John Doe (Cardiometabolic Risk, 52y)');
    expect(content).toContain('ApoB (Apolipoprotein B)');
    expect(filename).toContain('MyChart_Brief');
  });
});

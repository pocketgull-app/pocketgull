import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbientScribeDrawerComponent } from './ambient-scribe-drawer.component';
import { AmbientScribeAdapterService } from '../../services/ambient-scribe-adapter.service';
import { PatientStateService } from '../../services/patient-state.service';
import { IsmpSafetyGuardService } from '../../services/ismp-safety-guard.service';
import { EhrWritebackService } from '../../services/fhir/ehr-writeback.service';
import { MimicOmopBenchmarkService } from '../../services/research/mimic-omop-benchmark.service';

describe('AmbientScribeDrawerComponent', () => {
  let component: AmbientScribeDrawerComponent;
  let fixture: ComponentFixture<AmbientScribeDrawerComponent>;
  let scribeService: AmbientScribeAdapterService;
  let patientState: PatientStateService;
  let ehrService: EhrWritebackService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbientScribeDrawerComponent],
      providers: [
        AmbientScribeAdapterService,
        PatientStateService,
        IsmpSafetyGuardService,
        EhrWritebackService,
        MimicOmopBenchmarkService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AmbientScribeDrawerComponent);
    component = fixture.componentInstance;
    scribeService = TestBed.inject(AmbientScribeAdapterService);
    patientState = TestBed.inject(PatientStateService);
    ehrService = TestBed.inject(EhrWritebackService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Ambient AI Scribe Ingestion header & sources', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ambient AI Scribe Ingestion & CDS Adjudication');
    expect(el.textContent).toContain('Strategic Reasoner Co-Pilot');
    expect(el.textContent).toContain('Abridge');
    expect(el.textContent).toContain('Nuance DAX Copilot');
    expect(el.textContent).toContain('Suki');
  });

  it('2. Loads presets and updates transcript textarea', () => {
    expect(component.selectedPresetId()).toBe('sciatica_ddi');
    expect(component.transcriptText()).toContain('gabapentin 300.0 mg');

    component.loadPreset(component.presets[1]); // Hypertension
    fixture.detectChanges();

    expect(component.selectedPresetId()).toBe('hypertension_stage2');
    expect(component.transcriptText()).toContain('lisinopril 10.0 mg');
  });

  it('3. Adjudicates transcript and displays Side-by-Side comparison with DDI, ISMP & CPT ROI', async () => {
    await component.adjudicate();
    fixture.detectChanges();

    expect(component.adjudicationResult()).toBeDefined();
    const res = component.adjudicationResult()!;
    expect(res.drugInteractions.length).toBeGreaterThan(0);
    expect(res.ismpSafetyAudit.hasViolations).toBe(true);
    expect(res.cptReimbursement.length).toBeGreaterThan(0);
    expect(res.totalEstimatedAnnualReimbursementUsd).toBeGreaterThan(0);

    const el = fixture.nativeElement as HTMLElement;
    // Side-by-side showcase view (default activeView: 'SHOWCASE')
    expect(el.textContent).toContain('What Passive Transcription Misses');
    expect(el.textContent).toContain('Zero DDI Screening');
    expect(el.textContent).toContain('Pocket-Gull Strategic Reasoner');
    expect(el.textContent).toContain('ISMP High-Risk Defect Intercept');
    expect(el.textContent).toContain('FDA Black Box Alert');
    expect(el.textContent).toContain('CPT RPM/RTM Coding Capture');
    expect(el.textContent).toContain('+$2076 / yr');
  });

  it('4. Navigates between SHOWCASE, CLINICAL DETAILS, and RAW JSON tabs', async () => {
    await component.adjudicate();
    fixture.detectChanges();

    // Switch to DETAILS tab
    component.setActiveView('DETAILS');
    fixture.detectChanges();
    let el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Synthesized SBAR Note');
    expect(el.textContent).toContain('S (Situation):');
    expect(el.textContent).toContain('A (Assessment):');

    // Switch to AUDIT_JSON tab
    component.setActiveView('AUDIT_JSON');
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('FDA 21 CFR Part 11 Electronic Record JSON');
    expect(el.textContent).toContain('SHA-256 Digest:');
    expect(el.textContent).toContain('totalEstimatedAnnualReimbursementUsd');

    // Switch back to SHOWCASE
    component.setActiveView('SHOWCASE');
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Speech-to-Text + Clinical Reasoning Symbiosis');
  });

  it('5. Toggles audio simulation playback', () => {
    expect(component.isPlayingAudio()).toBe(false);
    component.toggleAudioSimulation();
    expect(component.isPlayingAudio()).toBe(true);

    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Pause Audio');

    component.toggleAudioSimulation();
    expect(component.isPlayingAudio()).toBe(false);
    fixture.detectChanges();
    expect(el.textContent).toContain('Play Dialogue Audio');
  });

  it('6. Commits adjudicated transcript to chart when button clicked', async () => {
    const adjudicateSpy = vi.spyOn(scribeService, 'adjudicateTranscript');
    await component.adjudicate();
    fixture.detectChanges();

    expect(component.hasCommitted()).toBe(false);
    await component.commitToChart();
    fixture.detectChanges();

    expect(component.hasCommitted()).toBe(true);
    expect(adjudicateSpy).toHaveBeenCalledWith(expect.objectContaining({
      autoCommitToPatientState: true
    }));
  });

  it('7. Files SBAR note as FHIR R4 DocumentReference to EHR via EhrWritebackService', async () => {
    const writebackSpy = vi.spyOn(ehrService, 'executeWriteback');

    await component.adjudicate();
    fixture.detectChanges();

    expect(component.ehrWritebackReceipt()).toBeNull();
    await component.writeBackToEhr();
    fixture.detectChanges();

    expect(component.ehrWritebackReceipt()).toBeDefined();
    expect(component.ehrWritebackReceipt()?.overallStatus).toBe('SUCCESS_FILED_TO_EHR');
    expect(writebackSpy).toHaveBeenCalledWith(
      expect.objectContaining({ patientName: expect.any(String) }),
      expect.objectContaining({
        chiefComplaint: expect.any(String),
        situation: expect.any(String),
        assessment: expect.any(String)
      })
    );

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('FHIR R4 DocumentReference Filed:');
    expect(el.textContent).toContain('HTTP 201 Created');
  });
});

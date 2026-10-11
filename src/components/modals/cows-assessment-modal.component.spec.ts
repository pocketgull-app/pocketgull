import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CowsAssessmentModalComponent } from './cows-assessment-modal.component';
import { YaleAddictionProtocolService } from '../../services/yale-addiction-protocol.service';
import { EhrWritebackService } from '../../services/fhir/ehr-writeback.service';
import { PatientStateService } from '../../services/patient-state.service';
import { provideHttpClient } from '@angular/common/http';

import { NavigationShellService } from '../../services/navigation-shell.service';

describe('CowsAssessmentModalComponent', () => {
  let component: CowsAssessmentModalComponent;
  let fixture: ComponentFixture<CowsAssessmentModalComponent>;
  let protocolService: YaleAddictionProtocolService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CowsAssessmentModalComponent],
      providers: [
        YaleAddictionProtocolService,
        EhrWritebackService,
        PatientStateService,
        NavigationShellService,
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CowsAssessmentModalComponent);
    component = fixture.componentInstance;
    protocolService = TestBed.inject(YaleAddictionProtocolService);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('1. Initializes component with default view and zero score', () => {
    expect(component).toBeTruthy();
    expect(component.questionnaireItems.length).toBe(11);
    expect(component.activeTab()).toBe('ASSESSMENT');
    expect(component.totalScore()).toBe(0);
    expect(component.currentSeverity()).toBe('NONE');
  });

  it('2. Updates score when an item radio option is selected', async () => {
    await component.selectScore('resting_pulse', 2);
    await component.selectScore('sweating', 2);
    fixture.detectChanges();

    expect(component.totalScore()).toBe(4);
    expect(component.answers()['resting_pulse']).toBe(2);
    expect(component.answers()['sweating']).toBe(2);
  });

  it('3. Loads moderate withdrawal preset (Score 16) and transitions to Decision Support tab', async () => {
    await component.loadPreset('moderate');
    fixture.detectChanges();

    expect(component.totalScore()).toBe(16);
    expect(component.currentSeverity()).toBe('MODERATE');
    expect(component.activeTab()).toBe('DECISION_SUPPORT');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('YALE STANDARD RAPID INDUCTION');
    expect(compiled.textContent).toContain('Buprenorphine');
    expect(compiled.textContent).toContain('Universal Harm Reduction Mandate');
  });

  it('4. Loads mild withdrawal preset (Score 6) and shows comfort measures with buprenorphine blocked', async () => {
    await component.loadPreset('mild');
    fixture.detectChanges();

    expect(component.totalScore()).toBe(6);
    expect(component.currentSeverity()).toBe('MILD');
    expect(component.activeTab()).toBe('DECISION_SUPPORT');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('NON OPIOID COMFORT MEASURES');
    expect(compiled.textContent).toContain('CRITICAL_HIGH');
    expect(compiled.textContent).toContain('Clonidine');
    expect(compiled.textContent).toContain('Ondansetron');
  });

  it('5. Loads synthetic fentanyl preset and activates Low-Dose Initiation (LDI)', async () => {
    await component.loadPreset('fentanyl');
    fixture.detectChanges();

    expect(component.fentanylSuspected()).toBe(true);
    expect(component.activeTab()).toBe('DECISION_SUPPORT');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('LOW DOSE MICRO INDUCTION LDI');
    expect(compiled.textContent).toContain('0.5 mg');
  });

  it('6. Renders 4-Phase Whole-Person Restorative Plan in Tab 3', async () => {
    await component.loadPreset('moderate');
    component.activeTab.set('RESTORATIVE_PLAN');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Phase 1: Acute Stabilization');
    expect(compiled.textContent).toContain('Phase 2: Neuroplastic & Sleep Recovery');
    expect(compiled.textContent).toContain('Phase 3: Enteric & Biomechanical Resilience');
    expect(compiled.textContent).toContain('Phase 4: Social Coherence & Flourishing');
  });

  it('7. Triggers EHR writeback and renders confirmation receipt badge', async () => {
    vi.spyOn(protocolService, 'writeBackToEhr').mockResolvedValue({
      batchId: 'rcpt_cows_modal_999',
      ehrVendor: 'EPIC',
      timestamp: new Date().toISOString(),
      authMethod: 'private_key_jwt (RFC 7523)',
      clientId: 'pocketgull-client',
      receipts: [{
        resourceType: 'Observation',
        fhirId: 'obs_cows_999',
        loincCode: '72514-3',
        timestamp: new Date().toISOString(),
        httpStatus: 201,
        locationUrl: 'https://fhir.epic.com/R4/Observation/obs_cows_999',
        sha256AttestationSeal: 'seal_sha256_modal_cows'
      }],
      sbarDocumentReference: {},
      carePlan: {},
      conformalObservation: {},
      clientAssertionJwtHeader: {},
      clientAssertionJwtPayload: {},
      overallStatus: 'SUCCESS_FILED_TO_EHR'
    });

    await component.loadPreset('moderate');
    fixture.detectChanges();

    await component.fileToEhr();
    fixture.detectChanges();

    expect(component.writebackReceipt()).toBeDefined();
    expect(component.writebackReceipt()?.ehrVendor).toBe('EPIC');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('✓ Filed to EHR (EPIC)');
  });

  it('8. Emits close event when close button is clicked', () => {
    let emitted = false;
    component.close.subscribe(() => {
      emitted = true;
    });

    component.closeModal();
    expect(emitted).toBe(true);
  });

  it('9. Renders Recovery Companion cross-link and triggers modal launch', async () => {
    await component.loadPreset('moderate');
    component.activeTab.set('RESTORATIVE_PLAN');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Patient Recovery Companion & Longitudinal Telemetry');
    expect(compiled.textContent).toContain('Launch Daily Recovery Log');

    const btn = Array.from(compiled.querySelectorAll('button')).find(b => b.id === 'btn-open-recovery-companion');
    expect(btn).toBeTruthy();

    const navShell = TestBed.inject(NavigationShellService);
    const spy = vi.spyOn(navShell, 'openRecoveryModal');
    component.launchRecoveryCompanion();
    expect(spy).toHaveBeenCalled();
  });
});

import { TestBed } from '@angular/core/testing';
import { SpecialistReferralDossierService } from './specialist-referral-dossier.service';
import { RxGuardService } from './rx-guard.service';
import { WaveformDspEngineService } from './waveform-dsp-engine.service';
import { SkepticalEpistemologyService } from './skeptical-epistemology.service';

describe('SpecialistReferralDossierService', () => {
  let service: SpecialistReferralDossierService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SpecialistReferralDossierService,
        RxGuardService,
        WaveformDspEngineService,
        SkepticalEpistemologyService
      ]
    });
    service = TestBed.inject(SpecialistReferralDossierService);
  });

  it('should be created and initialize default cardiology gate', () => {
    expect(service).toBeTruthy();
    expect(service.selectedDomain()).toBe('cardiology');
    const gate = service.activeGate();
    expect(gate.domain).toBe('cardiology');
    expect(gate.readinessScore).toBeGreaterThanOrEqual(80);
    expect(gate.isApprovedForTransmission).toBe(true);
  });

  it('should evaluate prerequisite readiness and flag missing critical prerequisites', () => {
    // Simulate missing ECG and missing BMP
    const gate = service.evaluatePrerequisites('cardiology', [
      { id: 'cardio-ecg', status: 'missing' },
      { id: 'cardio-bmp', status: 'missing' }
    ]);

    expect(gate.isApprovedForTransmission).toBe(false);
    expect(gate.readinessScore).toBeLessThan(80);
    expect(gate.missingCriticalPrerequisites).toContain('12-Lead Resting Electrocardiogram (ECG)');
    expect(gate.missingCriticalPrerequisites).toContain('Serum Basic Metabolic Panel (eGFR & Potassium)');
  });

  it('should generate a compliant HL7 FHIR R4 ServiceRequest with WHO TM1 and Chou-Talalay extensions', () => {
    const fhir = service.generateFhirServiceRequest({
      patientId: 'pat-1049',
      patientName: 'Homo Sapiens (Female, 52y)',
      domain: 'cardiology',
      clinicalQuestion: 'Evaluate central aortic stiffness and microvascular resistance in non-dipping hypertension.',
      allopathicDiagnosis: { code: 'I10', display: 'Essential Hypertension' },
      whoTm1Code: 'SF50',
      pulseWaveVelocityMPerS: 9.8,
      botanicalPair: {
        agent1: 'Terminalia arjuna',
        dose1: 500,
        agent2: 'Crataegus oxyacantha',
        dose2: 300
      }
    });

    expect(fhir.resourceType).toBe('ServiceRequest');
    expect(fhir.code.coding[0].code).toBe('183515008'); // SNOMED Cardiology Referral
    expect(fhir.subject.reference).toBe('Patient/pat-1049');

    // Check WHO TM1 extension
    const tm1Ext = fhir.extension.find(e => e.url.includes('traditional-medicine-tm1'));
    expect(tm1Ext).toBeDefined();

    // Check Physical DSP telemetry extension
    const dspExt = fhir.extension.find(e => e.url.includes('physical-dsp-telemetry'));
    expect(dspExt).toBeDefined();

    // Check Chou-Talalay botanical safety extension
    const botExt = fhir.extension.find(e => e.url.includes('botanical-safety-disclosure'));
    expect(botExt).toBeDefined();

    // Check CMS-0057-F Prior Auth token
    const cmsExt = fhir.extension.find(e => e.url.includes('cms-0057-f-prior-auth'));
    expect(cmsExt).toBeDefined();
  });

  it('should generate a complete Tri-Directional Re-Entry Brief closing the loop with Dr. Crumpler standard', () => {
    const brief = service.generateTriDirectionalReEntryBrief({
      referralId: 'ref-cardio-991',
      domain: 'cardiology',
      patientName: 'Sarah Jenkins',
      clinicalImpression: 'Stage 2 Hypertension with accelerated aortic pulse wave velocity and microvascular endothelial dysfunction.',
      medicationsToTitrate: [
        { name: 'Telmisartan', dose: '40mg daily', targetDose: '80mg daily', purpose: 'Relaxes blood vessels and lowers central aortic pressure' }
      ],
      monitoringLabs: [
        { test: 'Serum BMP (eGFR & Potassium)', intervalWeeks: 3, responsible: 'PCP', alert: 'K+ > 5.2 or eGFR drop > 25%' }
      ],
      redFlags: ['Sudden crushing chest tightness', 'Shortness of breath lying flat', 'Dizziness standing up'],
      homeInstructions: [
        'Rest quietly for 5 minutes before taking morning blood pressure.',
        'Use the simple paper log provided, writing down top and bottom numbers.',
        'Keep warm socks on in the evening to help foot blood flow.'
      ]
    });

    expect(brief.referralId).toBe('ref-cardio-991');
    expect(brief.specialistEhrNote.formalOrders.length).toBeGreaterThan(0);
    expect(brief.pcpCoManagementContract.laboratoryMonitoringSchedule[0].testName).toContain('Serum BMP');
    expect(brief.crumplerPatientGuide.readingLevel).toContain('Dr. Rebecca Lee Crumpler Standard');
    expect(brief.crumplerPatientGuide.dailyMedicationSchedule[0].plainPurpose).toBe('Relaxes blood vessels and lowers central aortic pressure');
    expect(brief.crumplerPatientGuide.whenToCallUsImmediately.length).toBe(3);
  });
});

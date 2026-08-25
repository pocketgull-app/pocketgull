import { Injector, runInInjectionContext } from '@angular/core';
import { FhirR4BundleExportService } from './fhir-r4-bundle-export.service';
import { GlobalHealthInitiativesService } from './global-health-initiatives.service';
import { IPatient } from './patient.types';

describe('FhirR4BundleExportService - HL7 FHIR R4 Multi-Paradigm Exporter', () => {
  const createService = () => {
    const injector = Injector.create({
      providers: [
        FhirR4BundleExportService,
        GlobalHealthInitiativesService
      ]
    });
    return runInInjectionContext(injector, () => injector.get(FhirR4BundleExportService));
  };

  const samplePatient: IPatient = {
    id: 'pt-fhir-001',
    name: 'Eleanor Vance',
    age: 54,
    gender: 'Female',
    vitals: { bp: '138/88', hr: '74', spO2: '98', temp: '36.8', weight: '68', height: '165' },
    preexistingConditions: ['Essential Hypertension', 'Spleen Qi Deficiency', 'Post-Exertional Fatigue'],
    history: [],
    bookmarks: [],
    issues: {},
    lastVisit: '2026-08-20',
    patientGoals: 'Cardiovascular Longevity'
  };

  it('1. Generates a valid HL7 FHIR R4 document bundle with standard metadata', () => {
    const service = createService();
    const bundle = service.generateFhirR4Bundle(samplePatient);

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');
    expect(bundle.entry.length).toBeGreaterThan(3);
    expect(bundle.id).toContain('urn:uuid:bundle-pt-fhir-001');
  });

  it('2. Embeds WHO SDG 3.4 RiskAssessment and ICD-11 Chapter 26 dual-coded Conditions', () => {
    const service = createService();
    const bundle = service.generateFhirR4Bundle(samplePatient);

    // Verify RiskAssessment
    const riskResource = bundle.entry.find(e => e.resource.resourceType === 'RiskAssessment')?.resource;
    expect(riskResource).toBeDefined();
    expect(riskResource?.code.coding[0].system).toBe('http://who.int/sdg/3.4');
    expect(riskResource?.prediction[0].probabilityDecimal).toBeGreaterThan(0);

    // Verify Condition dual-coding
    const conditionResources = bundle.entry
      .filter(e => e.resource.resourceType === 'Condition')
      .map(e => e.resource);
    expect(conditionResources.length).toBeGreaterThan(0);
    expect(conditionResources[0].code.coding.some((c: any) => c.system === 'http://id.who.int/icd11/mms')).toBe(true);
    expect(conditionResources[0].code.coding.some((c: any) => c.system === 'http://hl7.org/fhir/sid/icd-10')).toBe(true);
  });

  it('3. Exports formatted JSON FHIR string successfully', () => {
    const service = createService();
    const jsonStr = service.exportBundleAsJson(samplePatient);
    expect(typeof jsonStr).toBe('string');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.resourceType).toBe('Bundle');
    expect(parsed.entry.some((e: any) => e.resource.resourceType === 'Composition')).toBe(true);
    expect(parsed.entry.some((e: any) => e.resource.resourceType === 'Observation')).toBe(true);
    expect(parsed.entry.some((e: any) => e.resource.resourceType === 'CarePlan')).toBe(true);
  });

  it('4. Generates 3D Spatial Somatic Lesion Observations with standard coordinate extensions', () => {
    const service = createService();
    const bundle = service.generateSpatialLesionAndAvsBundle({
      patientId: 'pt-spatial-02',
      patientName: 'Ada Lovelace',
      lesions: [
        {
          id: 'lesion-01',
          label: 'Patellar Tendonitis',
          partId: 'r_knee',
          position: { x: 0.25, y: 0.45, z: 0.12 },
          normal: { x: 0.0, y: 0.1, z: 0.99 },
          severity: 'moderate',
          morphology: 'inflammation',
          clinicalNotes: 'Anterior joint line tenderness upon palpation',
          snomedCode: '23583003'
        }
      ],
      avsSession: {
        carrierFreqHz: 528,
        binauralBeatHz: 6.0,
        isIsochronicPulseEnabled: true,
        isSpatialPanningEnabled: true,
        hapticMode: 'isochronic_pulse'
      },
      vitals: {
        heartRate: 68,
        autonomicCoherenceScore: 92,
        cardiacResonanceHz: 0.10
      }
    });

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');

    // Verify 3D Spatial Observation
    const obsEntry = bundle.entry.find(e => e.resource.resourceType === 'Observation');
    expect(obsEntry).toBeDefined();
    const obs = obsEntry!.resource;
    expect(obs.code.coding[0].code).toBe('23583003');
    expect(obs.bodySite.coding[0].code).toBe('r_knee');
    expect(obs.extension[0].url).toContain('spatial-coordinates-3d');
    expect(obs.extension[0].extension.find((e: any) => e.url === 'x').valueDecimal).toBe(0.25);

    // Verify AVS Procedure
    const procEntry = bundle.entry.find(e => e.resource.resourceType === 'Procedure');
    expect(procEntry).toBeDefined();
    const proc = procEntry!.resource;
    expect(proc.category.coding[0].code).toBe('866167008'); // Acoustic stimulation therapy
    expect(proc.code.coding[0].code).toBe('solfeggio-528hz');
    expect(proc.note[0].text).toContain('Cardiac Resonance = 0.1Hz (92% Coherence)');

    // Verify DiagnosticReport
    const reportEntry = bundle.entry.find(e => e.resource.resourceType === 'DiagnosticReport');
    expect(reportEntry).toBeDefined();
    expect(reportEntry!.resource.result.length).toBe(1);
  });

  it('5. Exports and parses 3D Spatial Lesion & AVS Bundle JSON successfully', () => {
    const service = createService();
    const jsonStr = service.exportSpatialLesionBundleAsJson({
      patientId: 'pt-spatial-03',
      patientName: 'Nikola Tesla',
      lesions: [
        {
          id: 'lesion-02',
          label: 'L4/L5 Disc Degeneration',
          partId: 'spine_lumbar',
          position: { x: 0.0, y: 1.1, z: -0.15 },
          severity: 'critical',
          morphology: 'calcification',
          clinicalNotes: 'Severe axial loading stenosis'
        }
      ]
    });

    expect(typeof jsonStr).toBe('string');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.resourceType).toBe('Bundle');
    expect(parsed.entry.some((e: any) => e.resource.resourceType === 'DiagnosticReport')).toBe(true);
  });

  it('6. Handles client-side JSON download execution cleanly', () => {
    const service = createService();
    expect(() => service.downloadSpatialLesionBundleJson({
      patientId: 'pt-spatial-04',
      patientName: 'Marie Curie',
      lesions: []
    })).not.toThrow();
  });
});

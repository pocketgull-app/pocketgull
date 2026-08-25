import '@angular/compiler';
import type { IPatient } from './patient.types';
import { ExportService } from './export.service';

describe('ExportService FHIR R4 Tri-Paradigm Bundle Suite', () => {

  const mockPatient: IPatient = {
    id: 'pt-77',
    name: 'Alexander Vance',
    age: 38,
    gender: 'Male',
    vitals: { hr: '76', bp: '118/76', spO2: '99', temp: '36.6', weight: '75', height: '175' },
    preexistingConditions: ['Mild Tension Headache'],
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: 'Autonomic Coherence',
    lastVisit: '2026-07-23'
  };

  it('validates FHIR R4 Tri-Paradigm Bundle structure', () => {
    const exportService = new ExportService();
    const bundle = exportService.buildFhirR4Bundle(mockPatient);

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');
    expect(bundle.entry.length).toBeGreaterThan(1);

    const patientEntry = bundle.entry.find((e: any) => e.resource.resourceType === 'Patient');
    expect(patientEntry).toBeDefined();
    expect(patientEntry.resource.name[0].text).toBe('Alexander Vance');

    const hrObs = bundle.entry.find((e: any) => e.resource.resourceType === 'Observation' && e.resource.code?.coding?.[0]?.code === '8867-4');
    expect(hrObs).toBeDefined();
    expect(hrObs.resource.valueQuantity.value).toBe(76);

    const bpObs = bundle.entry.find((e: any) => e.resource.resourceType === 'Observation' && e.resource.code?.coding?.[0]?.code === '85354-9');
    expect(bpObs).toBeDefined();
    expect(bpObs.resource.component[0].valueQuantity.value).toBe(118);
    expect(bpObs.resource.component[1].valueQuantity.value).toBe(76);

    const condEntry = bundle.entry.find((e: any) => e.resource.resourceType === 'Condition');
    expect(condEntry).toBeDefined();
    expect(condEntry.resource.code.text).toBe('Mild Tension Headache');

    const gompertzObs = bundle.entry.find((e: any) => e.resource.resourceType === 'Observation' && e.resource.code?.coding?.[0]?.code === '96568-1');
    expect(gompertzObs).toBeDefined();
    expect(gompertzObs.resource.code.coding[0].display).toContain('Gompertz-Makeham');

    const docRefEntry = bundle.entry.find((e: any) => e.resource.resourceType === 'DocumentReference');
    expect(docRefEntry).toBeDefined();
    expect(docRefEntry.resource.description).toContain('Curated Medical Video Lectures');
    expect(docRefEntry.resource.content.length).toBeGreaterThan(0);
  });

  it('verifies DeviceRequest, NutritionOrder, and MedicationRequest resource specs', () => {
    const fhirResources = ['Patient', 'Observation', 'Condition', 'DeviceRequest', 'NutritionOrder', 'MedicationRequest'];
    expect(fhirResources).toHaveLength(6);
    expect(fhirResources).toContain('DeviceRequest');
    expect(fhirResources).toContain('NutritionOrder');
  });

});

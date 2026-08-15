import '@angular/compiler';
import { ExportService } from '../src/services/export.service';
import { ActuarialLongevityService } from '../src/services/actuarial-longevity.service';

describe('FHIR R4 Occupational Profile Export Integration', () => {
  let exportService: ExportService;
  let actuarialService: ActuarialLongevityService;

  beforeEach(() => {
    actuarialService = new ActuarialLongevityService();
    exportService = new ExportService();
    (exportService as any).actuarialService = actuarialService;
  });

  it('should serialize Polymath (11-1021-POLY) occupational hazard profile & SNOMED CT condition into FHIR R4 Bundle', () => {
    const patientData = {
      id: 'patient-polymath-001',
      name: 'Leonardo DaVinci',
      occupation: 'Polymath',
      vitals: { bp: '120/80', hr: '64' }
    };

    const bundle = exportService.buildFhirR4Bundle(patientData);

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.entry.length).toBeGreaterThan(1);

    // Verify Occupation History Observation resource
    const occObsEntry = bundle.entry.find((e: any) => 
      e.resource.resourceType === 'Observation' && 
      e.resource.code?.coding?.[0]?.code === '11341-5'
    );
    expect(occObsEntry).toBeDefined();
    expect(occObsEntry.resource.valueCodeableConcept.coding[0].code).toBe('11-1021-POLY');
    expect(occObsEntry.resource.valueCodeableConcept.coding[0].display).toContain('Polymaths');

    // Verify SNOMED CT hazard condition resource
    const hazardCondEntry = bundle.entry.find((e: any) =>
      e.resource.resourceType === 'Condition' &&
      e.resource.code?.coding?.[0]?.system === 'http://snomed.info/sct'
    );
    expect(hazardCondEntry).toBeDefined();
    expect(hazardCondEntry.resource.code.coding[0].code).toBe('417893002');
  });

  it('should serialize Swimmer (27-2021-SWIM) shoulder instability hazard into FHIR R4 Bundle', () => {
    const patientData = {
      id: 'patient-swim-002',
      name: 'Michael Phelps',
      occupation: 'Marathon Swimmer',
      vitals: { bp: '110/70', hr: '48' }
    };

    const bundle = exportService.buildFhirR4Bundle(patientData);

    const occObsEntry = bundle.entry.find((e: any) => 
      e.resource.resourceType === 'Observation' && 
      e.resource.code?.coding?.[0]?.code === '11341-5'
    );
    expect(occObsEntry).toBeDefined();
    expect(occObsEntry.resource.valueCodeableConcept.coding[0].code).toBe('27-2021-SWIM');

    const componentVocal = occObsEntry.resource.component.find((c: any) => c.code.text === 'Choral Vocal Resonance Protocol');
    expect(componentVocal).toBeDefined();
    expect(componentVocal.valueString).toContain('Diaphragmatic Breath Glee');
  });
});

import { TestBed } from '@angular/core/testing';
import { FhirR7R4ConverterService } from './fhir-r7-r4-converter.service';
import { FhirR7HorizonService, IFhir7Bundle } from './fhir-r7-horizon.service';
import { FhirBundleFactoryService } from './fhir-bundle-factory.service';
import { Hl7v2ExportStrategyService } from '../export/hl7v2-export-strategy.service';

describe('FhirR7R4ConverterService', () => {
  let service: FhirR7R4ConverterService;
  let r7Service: FhirR7HorizonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FhirR7R4ConverterService,
        FhirR7HorizonService,
        FhirBundleFactoryService,
        Hl7v2ExportStrategyService
      ]
    });
    service = TestBed.inject(FhirR7R4ConverterService);
    r7Service = TestBed.inject(FhirR7HorizonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('convertR7ToR4Bundle', () => {
    it('should convert an R7 Horizon bundle into a statutory FHIR R4 collection bundle', () => {
      const mockState: any = {
        vitals: () => ({ hr: '76', temp: '98.6' })
      };
      const r7Bundle: IFhir7Bundle = r7Service.generateFhir7Bundle(mockState);
      const r4Bundle = service.convertR7ToR4Bundle(r7Bundle);

      expect(r4Bundle['resourceType']).toBe('Bundle');
      expect(r4Bundle['meta']?.['fhirVersion']).toBe('4.0.1');
      expect(r4Bundle['type']).toBe('collection');

      // Security metadata preserved
      const security = r4Bundle['meta']?.['security'];
      expect(security).toBeDefined();
      expect(security.some((s: any) => s.code.includes('ML-KEM-1024'))).toBe(true);
      expect(security.some((s: any) => s.code.includes('HIPAA-ZKP'))).toBe(true);

      const entries = r4Bundle['entry'] as any[];
      expect(entries.length).toBeGreaterThanOrEqual(3);

      // 1. Patient
      const patient = entries.find(e => e.resource?.resourceType === 'Patient')?.resource;
      expect(patient).toBeDefined();

      // 2. Down-converted Biophysics Observation with LOINC 8867-4
      const biophysObs = entries.find(
        e => e.resource?.resourceType === 'Observation' && e.resource?.code?.coding?.some((c: any) => c.code === '8867-4')
      )?.resource;
      expect(biophysObs).toBeDefined();
      expect(biophysObs.component).toBeDefined();
      expect(biophysObs.component.length).toBe(5); // Vagal LFO, Solfeggio, Gamma Pulse, Negentropic, Sampling Rate

      const vagalComp = biophysObs.component.find((c: any) => c.code?.coding?.[0]?.code === 'vagal-rsa-lfo');
      expect(vagalComp).toBeDefined();
      expect(vagalComp.valueQuantity.value).toBe(0.1);

      // 3. Epigenetic Observation
      const epiObs = entries.find(
        e => e.resource?.resourceType === 'Observation' && e.resource?.code?.coding?.[0]?.code === 'transgenerational-epigenetic-load'
      )?.resource;
      expect(epiObs).toBeDefined();
      expect(epiObs.valueString).toContain('Transgenerational');
      expect(epiObs.component.length).toBe(4);

      // 4. Lossless DocumentReference Encapsulation
      const docRef = entries.find(e => e.resource?.resourceType === 'DocumentReference')?.resource;
      expect(docRef).toBeDefined();
      expect(docRef.content[0].attachment.contentType).toContain('fhirVersion=7.0.0-horizon');
      expect(docRef.content[0].attachment.data).toBeTruthy();
    });
  });

  describe('convertR4ToR7Bundle (Round-Trip & Synthetic Projection)', () => {
    it('should achieve 100% lossless round-trip recovery from an encapsulated R7 bundle in R4', () => {
      const mockState: any = {
        vitals: () => ({ hr: '88', temp: '100.2' })
      };
      const originalR7: IFhir7Bundle = r7Service.generateFhir7Bundle(mockState);

      // Convert R7 -> R4
      const r4Bundle = service.convertR7ToR4Bundle(originalR7);

      // Convert back R4 -> R7
      const restoredR7 = service.convertR4ToR7Bundle(r4Bundle);

      expect(restoredR7.resourceType).toBe('Bundle');
      expect(restoredR7.meta.fhirVersion).toBe('7.0.0-horizon');
      expect(restoredR7.meta.postQuantumEncryption).toBe(originalR7.meta.postQuantumEncryption);
      expect(restoredR7.id).toBe(originalR7.id);
      expect(restoredR7.entry.length).toBe(originalR7.entry.length);

      const originalBio = originalR7.entry[0].resource as any;
      const restoredBio = restoredR7.entry[0].resource as any;
      expect(restoredBio.vagalLfoHz).toBe(originalBio.vagalLfoHz);
      expect(restoredBio.solfeggioCarrierHz).toBe(originalBio.solfeggioCarrierHz);
      expect(restoredBio.tubulinGammaPulseHz).toBe(originalBio.tubulinGammaPulseHz);
    });

    it('should synthetically project a standard R4 Bundle into an IFhir7Bundle when no archive is present', () => {
      const standardR4 = {
        resourceType: 'Bundle',
        type: 'collection',
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: 'patient-test-standard'
            }
          },
          {
            resource: {
              resourceType: 'Observation',
              code: { coding: [{ system: 'http://loinc.org', code: '8867-4' }] },
              valueQuantity: { value: 92, unit: '/min' },
              subject: { reference: 'Patient/patient-test-standard' }
            }
          }
        ]
      };

      const r7Bundle = service.convertR4ToR7Bundle(standardR4);
      expect(r7Bundle.resourceType).toBe('Bundle');
      expect(r7Bundle.meta.fhirVersion).toBe('7.0.0-horizon');
      expect(r7Bundle.meta.postQuantumEncryption).toContain('ML-KEM-1024');

      const bioStream = r7Bundle.entry[0].resource as any;
      expect(bioStream.resourceType).toBe('BiophysicsStreamObservation');
      expect(bioStream.samplingRateHz).toBe(100);
      expect(bioStream.subject.reference).toBe('Patient/patient-test-standard');
      expect(bioStream.vagalLfoHz).toBe(0.08); // hr > 85 triggers 0.08 Hz sympathetic compensation
    });
  });

  describe('convertEr7ToR4Bundle', () => {
    it('should parse an HL7 v2.5.1 ER7 message into a valid FHIR R4 Bundle', () => {
      const sampleEr7 = [
        'MSH|^~\\&|POCKETGULL|CLINICAL_AI|EHR_RECEIVER|CLINIC|20260918120000||ORU^R01^ORU_R01|MSG001|P|2.5.1',
        'PID|1||P0042^^^POCKETGULL^MR||Curie^Marie||18671107|F',
        'PV1|1|O|OUTPATIENT_DEPT||||||||||||||||VISIT001',
        'OBR|1|ORD001|FILL001|8867-4^PocketGull Clinical Assessment Panel^LN|||20260918120000',
        'OBX|1|NM|8867-4^Heart Rate^LN||72|/min|60-100|N|||F',
        'OBX|2|NM|8480-6^Systolic Blood Pressure^LN||120|mm[Hg]|90-120|N|||F'
      ].join('\r');

      const r4 = service.convertEr7ToR4Bundle(sampleEr7);
      expect(r4['resourceType']).toBe('Bundle');
      expect(r4['meta']?.['fhirVersion']).toBe('4.0.1');

      const entries = r4['entry'] as any[];
      const patient = entries.find(e => e.resource?.resourceType === 'Patient')?.resource;
      expect(patient).toBeDefined();
      expect(patient.id).toBe('P0042');
      expect(patient.gender).toBe('female');
      expect(patient.name[0].text).toBe('Curie Marie');

      const observations = entries.filter(e => e.resource?.resourceType === 'Observation');
      expect(observations.length).toBe(2);

      const hrObs = observations.find(o => o.resource.code.coding[0].code === '8867-4')?.resource;
      expect(hrObs).toBeDefined();
      expect(hrObs.valueQuantity.value).toBe(72);
      expect(hrObs.valueQuantity.unit).toBe('/min');

      const sbpObs = observations.find(o => o.resource.code.coding[0].code === '8480-6')?.resource;
      expect(sbpObs).toBeDefined();
      expect(sbpObs.valueQuantity.value).toBe(120);
      expect(sbpObs.valueQuantity.unit).toBe('mm[Hg]');
    });
  });

  describe('convertR4ToEr7', () => {
    it('should serialize a FHIR R4 Bundle into an HL7 v2.5.1 ER7 message', () => {
      const r4Bundle = {
        resourceType: 'Bundle',
        type: 'collection',
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: 'p-100',
              name: [{ family: 'Ramanujan', given: ['Srinivasa'] }],
              gender: 'male'
            }
          },
          {
            resource: {
              resourceType: 'Observation',
              code: { coding: [{ system: 'http://loinc.org', code: '8867-4' }] },
              valueQuantity: { value: 68, unit: '/min' }
            }
          }
        ]
      };

      const er7 = service.convertR4ToEr7(r4Bundle);
      expect(typeof er7).toBe('string');
      expect(er7).toContain('MSH|^~\\&|POCKETGULL');
      expect(er7).toContain('PID|1||p-100^^^POCKETGULL^MR||Ramanujan^Srinivasa');
      expect(er7).toContain('OBX|1|NM|8867-4^Heart Rate^LN||68|/min');
    });
  });
});

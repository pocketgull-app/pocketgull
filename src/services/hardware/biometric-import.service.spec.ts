import { TestBed } from '@angular/core/testing';
import { BiometricImportService } from './biometric-import.service';
import { PatientStateService } from '../patient-state.service';

describe('BiometricImportService', () => {
  let service: BiometricImportService;
  let mockPatientState: any;

  beforeEach(() => {
    mockPatientState = {
      addBiometricEntries: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        BiometricImportService,
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    });
    service = TestBed.inject(BiometricImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should import and parse Apple Health XML files', async () => {
    const xmlContent = `
      <?xml version="1.0" encoding="UTF-8"?>
      <HealthData locale="en_US">
        <Record type="HKQuantityTypeIdentifierHeartRate" value="78" unit="count/min" startDate="2026-08-16 12:00:00 -0700"/>
        <Record type="HKQuantityTypeIdentifierOxygenSaturation" value="0.99" unit="%" startDate="2026-08-16 12:00:00 -0700"/>
        <Record type="HKQuantityTypeIdentifierBloodGlucose" value="105" unit="mg/dL" startDate="2026-08-16 12:05:00 -0700"/>
      </HealthData>
    `;

    const file = new File([xmlContent], 'export.xml', { type: 'text/xml' });
    await service.importFile(file);

    expect(mockPatientState.addBiometricEntries).toHaveBeenCalled();
    const passedEntries = mockPatientState.addBiometricEntries.mock.calls[0][0];
    expect(passedEntries.length).toBe(3);
    expect(passedEntries[0].type).toBe('hr');
    expect(passedEntries[0].value).toBe(78);
    expect(passedEntries[1].type).toBe('spo2');
    expect(passedEntries[1].value).toBe(99);
    expect(passedEntries[2].type).toBe('glucose');
    expect(passedEntries[2].value).toBe(105);
  });

  it('should import and parse CSV biometric files', async () => {
    const csvContent = `timestamp,heart_rate,systolic,diastolic\n2026-08-16T12:00:00Z,72,120,80`;
    const file = new File([csvContent], 'vitals.csv', { type: 'text/csv' });
    await service.importFile(file);

    expect(mockPatientState.addBiometricEntries).toHaveBeenCalled();
  });
});

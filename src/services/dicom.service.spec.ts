import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { DicomService, IDicomStudy } from './dicom.service';
import { PatientStateService } from './patient-state.service';
import { PatientManagementService } from './patient-management.service';
import { WhispySwarmBioreactorService } from './whispy-swarm-bioreactor.service';

describe('DicomService Scan-to-Bioreactor Pipeline', () => {
  let service: DicomService;
  let bioreactorService: WhispySwarmBioreactorService;

  beforeEach(() => {
    const mockPatientState = {
      isDemoMode: signal(true)
    };

    const mockPatientManager = {
      selectedPatient: signal({ id: 'p_default_patient', name: 'Homo Sapiens (Male, 44y)', preexistingConditions: ['Lumbar Disc Herniation'] }),
      selectedPatientId: signal('p_default_patient')
    };

    TestBed.configureTestingModule({
      providers: [
        DicomService,
        WhispySwarmBioreactorService,
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PatientManagementService, useValue: mockPatientManager }
      ]
    });

    service = TestBed.inject(DicomService);
    bioreactorService = TestBed.inject(WhispySwarmBioreactorService);
  });

  it('should search studies in demo mode and filter for active patient', async () => {
    await service.searchStudies();
    const studies = service.studies();
    expect(studies.length).toBeGreaterThan(0);
    expect(service.selectedStudy()).toBeTruthy();
    expect(service.selectedStudy()?.patientId).toBe('p_default_patient');
  });

  it('should dispatch selected DICOM study to Whispy Healing Swarm Bioreactor', () => {
    const testStudy: IDicomStudy = {
      studyInstanceUid: '1.2.840.113619.test.spine.1',
      studyDescription: 'L4-L5 Herniated Nucleus Pulposus Volumetric MRI',
      patientName: 'Homo Sapiens',
      patientId: 'p_default_patient',
      frameCount: 32
    };

    service.selectedStudy.set(testStudy);
    const receipt = service.dispatchToBioreactor(testStudy);

    expect(receipt.scanUid).toBe('1.2.840.113619.test.spine.1');
    expect(receipt.description).toContain('L4-L5');
    expect(receipt.voxelCount).toBe(32 * 64);
    expect(receipt.phase).toBe('SCAN_INGESTION');
    expect(receipt.timestamp).toBeDefined();

    // Verify Bioreactor state updated
    expect(bioreactorService.patientScanId()).toBe('1.2.840.113619.test.spine.1');
    expect(bioreactorService.targetVoxelCount()).toBe(32 * 64);
    expect(bioreactorService.currentPhase()).toBe('SCAN_INGESTION');
    expect(service.lastBioreactorDispatch()).toEqual(receipt);
  });

  it('should generate rendered image data URL for CT bone window', () => {
    const url = service.getRenderedImageUrl(
      'study-1',
      'series-1',
      'instance-1',
      undefined,
      undefined,
      undefined,
      undefined,
      16,
      'CT'
    );
    expect(url).toContain('data:image/svg+xml');
    expect(url).toContain('Vertebral Body Cortical Shell');
  });
});

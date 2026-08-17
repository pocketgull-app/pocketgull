import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { PatientManagementService } from './patient-management.service';
import { PatientStateService } from './patient-state.service';
import { StorageService } from './storage.service';
import { ClinicalIntelligenceService } from './clinical-intelligence.service';
import { NetworkStateService } from './network-state.service';
import { ThemeService } from './theme.service';

describe('PatientManagementService & Cloud Sync Suite', () => {
  let service: PatientManagementService;
  let mockHttp: { post: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn> };
  let mockPatientState: {
    isDemoMode: ReturnType<typeof vi.fn>;
    getCurrentState: ReturnType<typeof vi.fn>;
    activePatientSummary: ReturnType<typeof vi.fn>;
    updateActivePatientSummary: ReturnType<typeof vi.fn>;
    loadState: ReturnType<typeof vi.fn>;
    selectPart: ReturnType<typeof vi.fn>;
    selectNote: ReturnType<typeof vi.fn>;
    clearIssuesAndGoalsForReview: ReturnType<typeof vi.fn>;
    setViewingPastVisit: ReturnType<typeof vi.fn>;
    activePhilosophy: ReturnType<typeof vi.fn>;
    patientHistory: ReturnType<typeof signal>;
  };
  let mockStorage: {
    loadPatients: ReturnType<typeof vi.fn>;
    savePatient: ReturnType<typeof vi.fn>;
    deletePatient: ReturnType<typeof vi.fn>;
  };
  let mockNetwork: { isOnline: ReturnType<typeof vi.fn> };
  let mockGeminiService: {
    resetAIState: ReturnType<typeof vi.fn>;
    loadArchivedAnalysis: ReturnType<typeof vi.fn>;
    generateDynamicMockReport: ReturnType<typeof vi.fn>;
  };
  let mockThemeService: {
    applyThemeForPatient: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockHttp = {
      post: vi.fn().mockReturnValue(of({ success: true, count: 1 })),
      get: vi.fn().mockReturnValue(of([]))
    };
    mockPatientState = {
      isDemoMode: vi.fn().mockReturnValue(false),
      getCurrentState: vi.fn().mockReturnValue({
        symptoms: ['Fatigue'],
        preexistingConditions: ['Hypertension'],
        vitals: { bp: '120/80', hr: '72' }
      }),
      activePatientSummary: vi.fn().mockReturnValue('Clinical summary note'),
      updateActivePatientSummary: vi.fn(),
      loadState: vi.fn(),
      selectPart: vi.fn(),
      selectNote: vi.fn(),
      clearIssuesAndGoalsForReview: vi.fn(),
      setViewingPastVisit: vi.fn(),
      activePhilosophy: vi.fn().mockReturnValue('western'),
      patientHistory: signal([])
    };
    mockStorage = {
      loadPatients: vi.fn().mockResolvedValue([]),
      savePatient: vi.fn().mockResolvedValue(undefined),
      deletePatient: vi.fn().mockResolvedValue(undefined)
    };
    mockNetwork = {
      isOnline: vi.fn().mockReturnValue(true)
    };
    mockGeminiService = {
      resetAIState: vi.fn(),
      loadArchivedAnalysis: vi.fn(),
      generateDynamicMockReport: vi.fn().mockReturnValue({})
    };
    mockThemeService = {
      applyThemeForPatient: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        PatientManagementService,
        { provide: HttpClient, useValue: mockHttp },
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: StorageService, useValue: mockStorage },
        { provide: NetworkStateService, useValue: mockNetwork },
        { provide: ClinicalIntelligenceService, useValue: mockGeminiService },
        { provide: ThemeService, useValue: mockThemeService }
      ]
    });

    service = TestBed.inject(PatientManagementService);
  });

  it('initializes PatientManagementService cleanly', () => {
    expect(service).toBeDefined();
    expect(service.patients().length).toBeGreaterThan(0);
  });

  describe('syncToCloud()', () => {
    it('skips sync and returns true when in demo mode', async () => {
      mockPatientState.isDemoMode.mockReturnValue(true);

      const result = await service.syncToCloud();
      expect(result).toBe(true);
      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('returns false when offline and warns', async () => {
      mockNetwork.isOnline.mockReturnValue(false);

      const result = await service.syncToCloud();
      expect(result).toBe(false);
      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('posts patient payload to /api/patients when online and not in demo mode', async () => {
      const result = await service.syncToCloud();

      expect(result).toBe(true);
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/api/patients',
        expect.any(Array),
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });

    it('catches HTTP failure gracefully and returns false', async () => {
      mockHttp.post.mockReturnValue(throwError(() => new Error('500 Internal Server Error')));

      const result = await service.syncToCloud();
      expect(result).toBe(false);
    });
  });

  describe('Roster Management & FHIR Ingestion', () => {
    it('creates and selects a new patient profile', async () => {
      const initialCount = service.patients().length;

      const newId = await service.createNewPatient();
      expect(service.patients().length).toBe(initialCount + 1);
      const created = service.patients()[0];
      expect(created.name).toBe('New Patient');
      expect(service.selectedPatientId()).toBe(newId);
    });

    it('ingests a SMART on FHIR R4 bundle into patient roster', () => {
      const initialCount = service.patients().length;

      const mockFhirBundle = {
        resourceType: 'Bundle',
        type: 'collection',
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: 'fhir-123',
              name: [{ given: ['Grace'], family: 'Hopper' }],
              birthDate: '1906-12-09',
              gender: 'female'
            }
          },
          {
            resource: {
              resourceType: 'Condition',
              code: { text: 'Type 2 Diabetes' }
            }
          }
        ]
      };

      service.ingestFhirBundle(mockFhirBundle);
      expect(service.patients().length).toBe(initialCount + 1);
      const ingested = service.patients().find(p => p.name.includes('Grace Hopper'));
      expect(ingested).toBeDefined();
      expect(ingested?.preexistingConditions).toContain('Type 2 Diabetes');
    });

    it('removes a patient from the roster and updates storage', () => {
      const patientToDelete = service.patients()[0];
      const initialCount = service.patients().length;

      service.removePatient(patientToDelete.id);
      expect(service.patients().length).toBe(initialCount - 1);
      expect(mockStorage.deletePatient).toHaveBeenCalledWith(patientToDelete.id);
    });
  });
});

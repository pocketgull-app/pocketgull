import { TestBed } from '@angular/core/testing';
import { ClinicalGraphQLService } from './clinical-graphql.service';
import { PatientStateService } from './patient-state.service';
import { PatientManagementService } from './patient-management.service';
import { Section504AccommodationService } from './section-504-accommodation.service';
import { ClinicalSteeringCommitteeDossierService } from './clinical-steering-committee-dossier.service';
import { IntelligenceProviderToken } from './ai/intelligence.provider.token';
import { vi } from 'vitest';

describe('ClinicalGraphQLService', () => {
  let service: ClinicalGraphQLService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClinicalGraphQLService,
        PatientStateService,
        PatientManagementService,
        Section504AccommodationService,
        ClinicalSteeringCommitteeDossierService,
        {
          provide: IntelligenceProviderToken,
          useValue: { generateContent: vi.fn(), generateStream: vi.fn() }
        }
      ]
    });
    service = TestBed.inject(ClinicalGraphQLService);
  });

  it('should initialize and provide complete GraphQL schema SDL', () => {
    expect(service).toBeTruthy();
    expect(service.schemaSDL).toContain('type Patient');
    expect(service.schemaSDL).toContain('type Section504Plan');
    expect(service.schemaSDL).toContain('type SteeringCommitteeDossier');
    expect(service.schemaSDL).toContain('type BiologicalPathwayNode');
  });

  it('should execute a patient query with Section 504 and Vitals', async () => {
    const res = await service.executeQuery(`
      query GetPatientContext($id: ID!) {
        patient(id: $id) {
          name
          vitals { heartRate cgmGlucoseMgDl }
          section504Plan {
            primaryDiagnosis
            substituteCard { emergencyActionText }
          }
        }
      }
    `, { id: 'p001' });

    expect(res.errors).toBeUndefined();
    expect(res.data?.patient).toBeDefined();
    expect(res.data?.patient.name).toBeDefined();
    expect(res.data?.patient.vitals.heartRate).toBe(74);
    expect(res.data?.patient.section504Plan.primaryDiagnosis).toContain('Type 1 Diabetes');
    expect(res.data?.patient.section504Plan.substituteCard.emergencyActionText).toContain('immediate action');
  });

  it('should execute a multi-hop biological cross-talk query', async () => {
    const res = await service.executeQuery(`
      query GetCrossTalk {
        biologicalCrossTalk(sourceBiomarker: "PPD") {
          sourceBiomarker
          mediatorMolecule
          targetPathology
          levelATrialMatch
        }
      }
    `);

    expect(res.errors).toBeUndefined();
    expect(res.data?.biologicalCrossTalk.length).toBeGreaterThanOrEqual(2);
    expect(res.data?.biologicalCrossTalk[0].targetPathology).toContain('INOCA');
  });

  it('should execute a Steering Committee Dossier query', async () => {
    const res = await service.executeQuery(`
      query GetDossier($quarter: String, $institution: String) {
        steeringCommitteeDossier(quarter: $quarter, institution: $institution) {
          institutionName
          reportingQuarter
          fdaSection520oComplianceScore
        }
      }
    `, { quarter: '2026-Q3', institution: 'Harvard Medical Network' });

    expect(res.errors).toBeUndefined();
    expect(res.data?.steeringCommitteeDossier.institutionName).toBe('Harvard Medical Network');
    expect(res.data?.steeringCommitteeDossier.fdaSection520oComplianceScore).toBeGreaterThanOrEqual(99);
  });
});

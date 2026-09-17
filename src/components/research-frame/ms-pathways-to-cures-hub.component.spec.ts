import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MsPathwaysToCuresHubComponent } from './ms-pathways-to-cures-hub.component';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';
import { ClinicalSpecialtyRiskSuiteService } from '../../services/clinical-specialty-risk-suite.service';
import { p_mara_santos } from '../../mock-patients/p_mara_santos';
import { p_poms_adolescent } from '../../mock-patients/p_poms_adolescent';
import { p_loms_elder } from '../../mock-patients/p_loms_elder';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';
import { vi } from 'vitest';

describe('MsPathwaysToCuresHubComponent Suite', () => {
  let component: MsPathwaysToCuresHubComponent;
  let fixture: ComponentFixture<MsPathwaysToCuresHubComponent>;
  let patientState: PatientStateService;
  let patientManager: PatientManagementService;
  let riskSuite: ClinicalSpecialtyRiskSuiteService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MsPathwaysToCuresHubComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PatientStateService,
        PatientManagementService,
        ClinicalSpecialtyRiskSuiteService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock clinical research intelligence'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MsPathwaysToCuresHubComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    patientManager = TestBed.inject(PatientManagementService);
    riskSuite = TestBed.inject(ClinicalSpecialtyRiskSuiteService);
    fixture.detectChanges();
  });

  it('1. Initializes MsPathwaysToCuresHubComponent with active patient', () => {
    expect(component).toBeTruthy();
    expect(component.lifespan()).toBeDefined();
    expect(component.carePlan()).toBeDefined();
  });

  it('2. Correctly phenotypes Mara Santos as Adult RRMS with elevated Smoldering PIRA', () => {
    patientManager.selectedPatientId.set('p_mara_santos');
    fixture.detectChanges();

    const ls = component.lifespan();
    expect(ls.phenotype).toBe('ADULT_RRMS');
    expect(ls.piraPredominance).toBe('COMPARTMENTALIZED_SMOLDERING');
    expect(ls.smolderingPiraScore).toBeGreaterThanOrEqual(0.70);
    expect(component.formatPhenotype(ls.phenotype)).toContain('Adult Relapsing-Remitting MS');
  });

  it('3. Correctly phenotypes Pediatric POMS and Late-Onset LOMS', () => {
    // Pediatric POMS
    patientManager.selectedPatientId.set('p_poms_adolescent');
    fixture.detectChanges();
    const pomsLs = component.lifespan();
    expect(pomsLs.phenotype).toBe('PEDIATRIC_POMS');
    expect(pomsLs.relapseVelocityAnnualized).toBe(2.0);
    expect(pomsLs.immunosenescenceRisk).toBe('LOW');

    // Late-Onset LOMS
    patientManager.selectedPatientId.set('p_loms_elder');
    fixture.detectChanges();
    const lomsLs = component.lifespan();
    expect(lomsLs.phenotype).toBe('LATE_ONSET_LOMS_PPMS');
    expect(lomsLs.piraPredominance).toBe('SPINAL_CORD_PROGRESSIVE');
    expect(lomsLs.immunosenescenceRisk).toBe('HIGH');
  });

  it('4. Computes Uhthoff thermal conduction reserve', () => {
    const reserve = riskSuite.computeUhthoffThermalReserve(37.0, 72, 8);
    expect(reserve).toBeGreaterThan(0);
    expect(reserve).toBeLessThanOrEqual(1.20);
  });

  it('5. Adopts 3-Act Care Plan into PatientStateService on 1-click action', () => {
    patientManager.selectedPatientId.set('p_mara_santos');
    fixture.detectChanges();

    component.adoptCarePlan();

    expect(component.isAdopted()).toBe(true);
    expect(patientState.activeCarePlanNotes()).toContain('Act 1 (Baseline)');
    expect(patientState.activeCarePlanNotes()).toContain('Act 2 (Today)');
    expect(patientState.activeCarePlanNotes()).toContain('Act 3 (Roadmap)');
    expect(patientState.activeCarePlanNotes()).toContain('Continuous Pulse Telemetry');
    expect(patientState.activeCarePlanAdoptedTimestamp()).toBeDefined();
  });

  it('6. Emits selectQuery output when steering literature from an agile pivot trigger', () => {
    let emitted: { query: string; engine: 'pubmed' | 'gse' | 'google' } | undefined;
    component.selectQuery.subscribe((event) => {
      emitted = event;
    });

    component.steerLiterature('Bruton Tyrosine Kinase Inhibitor Smoldering MS');

    expect(emitted).toBeDefined();
    expect(emitted?.engine).toBe('pubmed');
    expect(emitted?.query).toContain('Bruton Tyrosine Kinase');
  });
});

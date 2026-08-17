import '@angular/compiler';
import { NsfGrantPortalComponent } from './nsf-grant-portal.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { AcademicLabRecruitmentService } from '../services/academic-lab-recruitment.service';
import { PatientStateService } from '../services/patient-state.service';

describe('NsfGrantPortalComponent', () => {
  let component: NsfGrantPortalComponent;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    const mockPatientState = {
      isDemoMode: signal(false)
    };

    const mockLabService = {
      curatedAcademicLabs: [
        {
          labId: 'lab_1',
          labName: 'Stanford Medicine Lab',
          principalInvestigator: 'Dr. Jane Doe',
          institution: 'Stanford University',
          researchFocus: 'Cardiovascular Genomics',
          matchingPocketGullDomain: 'Complex Systems' as const,
          labWebsiteUrl: 'https://stanford.edu',
          studentRecruitmentStatus: 'Actively Recruiting PhD / Postdocs' as const,
          location: 'Stanford, CA',
          featuredCitations: []
        }
      ]
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: AcademicLabRecruitmentService, useValue: mockLabService }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new NsfGrantPortalComponent();
    });
  });

  it('should initialize with NSF grant research pillars and academic lab records', () => {
    expect(component).toBeTruthy();
    expect(component.labs.length).toBeGreaterThan(0);
    expect(component.isDemoMode()).toBe(false);
  });
});

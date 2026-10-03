import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UkRioPubmedSourcingComponent } from './uk-rio-pubmed-sourcing.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('UkRioPubmedSourcingComponent', () => {
  let component: UkRioPubmedSourcingComponent;
  let fixture: ComponentFixture<UkRioPubmedSourcingComponent>;
  let patientState: PatientStateService;
  let patientManagement: PatientManagementService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UkRioPubmedSourcingComponent],
      providers: [
        PatientStateService,
        PatientManagementService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock clinical research insight'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UkRioPubmedSourcingComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    patientManagement = TestBed.inject(PatientManagementService);
    fixture.detectChanges();
  });

  it('1. Initializes with 4 PubMed literature citations and active patient name', () => {
    expect(component).toBeTruthy();
    expect(component.citations.length).toBe(4);
    expect(component.filteredCitations().length).toBe(4);
    expect(component.selectedTier()).toBe('ALL');
    expect(component.activePatientName()).toBeTruthy();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('PubMed Literature Sourcing & ICMJE Research Integrity');
    expect(el.textContent).toContain('Specialized Pro-Resolving Mediators');
    expect(el.textContent).toContain('Vagal Nerve Stimulation');
    expect(el.textContent).toContain('Piperine-Curcumin Bioavailability');
  });

  it('2. Filters citations dynamically by evidence tier (Grade A vs Grade B)', () => {
    // Filter to Grade A systematic reviews
    component.selectedTier.set('Grade A');
    fixture.detectChanges();
    const gradeA = component.filteredCitations();
    expect(gradeA.length).toBe(3);
    gradeA.forEach(c => expect(c.evidenceTier).toContain('Grade A'));

    // Filter to Grade B RCTs
    component.selectedTier.set('Grade B');
    fixture.detectChanges();
    const gradeB = component.filteredCitations();
    expect(gradeB.length).toBe(1);
    expect(gradeB[0].pmid).toBe('31252654');

    // Reset to ALL
    component.selectedTier.set('ALL');
    fixture.detectChanges();
    expect(component.filteredCitations().length).toBe(4);
  });

  it('3. Bookmarks literature citation to chart via patientState addClinicalNote', () => {
    const addNoteSpy = vi.spyOn(patientState, 'addClinicalNote');
    const citation = component.citations[0]; // SPM paper

    component.bookmarkCitation(citation);

    expect(addNoteSpy).toHaveBeenCalledTimes(1);
    const callArgs = addNoteSpy.mock.calls[0][0];
    expect(callArgs.text).toContain('PMID:32810291');
    expect(callArgs.text).toContain('Specialized Pro-Resolving Mediators');
    expect(callArgs.sourceLens).toBe('Functional Protocols');
  });

  it('4. Opens PubMed literature in research frame via patientState requestResearchSearch', () => {
    const searchSpy = vi.spyOn(patientState, 'requestResearchSearch');
    const citation = component.citations[1]; // Vagal paper

    component.openPubmedInResearchFrame(citation);

    expect(searchSpy).toHaveBeenCalledWith('29153549', 'pubmed');
  });

  it('5. Toggles ICMJE / AMA research integrity audit modal', () => {
    expect(component.isAuditModalOpen()).toBe(false);
    let el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('ICMJE / AMA Research Integrity Audit Log');

    // Open modal
    component.isAuditModalOpen.set(true);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('ICMJE / AMA Research Integrity Audit Log');
    expect(el.textContent).toContain('Sourcing Transparency & Evidence Tiers');
    expect(el.textContent).toContain('Conflict of Interest & COI Disclosures');
    expect(el.textContent).toContain('Cryptographic Provenance Hash');

    // Close modal
    component.isAuditModalOpen.set(false);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('ICMJE / AMA Research Integrity Audit Log');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AcademicCitationDrawerComponent } from './academic-citation-drawer.component';
import { AcademicCitationService } from '../services/academic-citation.service';

describe('AcademicCitationDrawerComponent', () => {
  let component: AcademicCitationDrawerComponent;
  let fixture: ComponentFixture<AcademicCitationDrawerComponent>;
  let citationService: AcademicCitationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicCitationDrawerComponent],
      providers: [AcademicCitationService]
    }).compileComponents();

    fixture = TestBed.createComponent(AcademicCitationDrawerComponent);
    component = fixture.componentInstance;
    citationService = TestBed.inject(AcademicCitationService);
    fixture.detectChanges();
  });

  it('should create the academic citation drawer component', () => {
    expect(component).toBeTruthy();
  });

  it('should list citations from the authority catalog', () => {
    const dossier = component.filteredDossier();
    expect(dossier.totalCitations).toBeGreaterThanOrEqual(6);
    expect(dossier.amaBibliography.length).toBeGreaterThanOrEqual(6);
  });

  it('should filter citations reactively based on search query', () => {
    component.searchQuery.set('Section 504');
    fixture.detectChanges();

    const dossier = component.filteredDossier();
    expect(dossier.entries.every(e => e.topic.includes('504') || e.statuteReference?.includes('504'))).toBe(true);
  });

  it('should emit close event when requested', () => {
    let closed = false;
    component.close.subscribe(() => closed = true);

    component.close.emit();
    expect(closed).toBe(true);
  });
});

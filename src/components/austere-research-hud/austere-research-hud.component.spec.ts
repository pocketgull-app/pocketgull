import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AustereResearchHudComponent } from './austere-research-hud.component';
import { AustereResearchService } from '../../services/austere-research.service';

describe('AustereResearchHudComponent', () => {
  let component: AustereResearchHudComponent;
  let fixture: ComponentFixture<AustereResearchHudComponent>;
  let service: AustereResearchService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AustereResearchHudComponent],
      providers: [AustereResearchService]
    }).compileComponents();

    service = TestBed.inject(AustereResearchService);
    service.restoreDefaultArchetype();

    fixture = TestBed.createComponent(AustereResearchHudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Austere HUD component', () => {
    expect(component).toBeTruthy();
  });

  it('should render biophysical vitals with optotypic legibility', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Austere Edge Profile');
    expect(compiled.textContent).toContain('Heart Rate');
    expect(compiled.textContent).toContain('HRV (SDNN)');
    expect(compiled.textContent).toContain('72');
  });

  it('should render 3-Act Trajectory roadmap sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Act I: Where You've Been");
    expect(compiled.textContent).toContain("Act II: Where You Stand Today");
    expect(compiled.textContent).toContain("Act III: Where You're Going");
  });

  it('should purge state when purge button is clicked', () => {
    fixture.detectChanges();
    component.purgeState();
    fixture.detectChanges();

    expect(service.isPurged()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('STATE PURGED');
  });

  it('should toggle FHIR R4 Bundle preview drawer', () => {
    expect(component.showFhirPreview()).toBe(false);
    component.toggleFhirPreview();
    fixture.detectChanges();

    expect(component.showFhirPreview()).toBe(true);
    expect(component.fhirJsonString()).toContain('Bundle');

    component.toggleFhirPreview();
    fixture.detectChanges();
    expect(component.showFhirPreview()).toBe(false);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopulationHealthEquityHubComponent } from './population-health-equity-hub.component';
import { PopulationHealthEquityService } from '../services/population-health-equity.service';

describe('PopulationHealthEquityHubComponent', () => {
  let component: PopulationHealthEquityHubComponent;
  let fixture: ComponentFixture<PopulationHealthEquityHubComponent>;
  let healthService: PopulationHealthEquityService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopulationHealthEquityHubComponent],
      providers: [PopulationHealthEquityService]
    }).compileComponents();

    fixture = TestBed.createComponent(PopulationHealthEquityHubComponent);
    component = fixture.componentInstance;
    healthService = TestBed.inject(PopulationHealthEquityService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders header and default active cohort', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Population Health & Global Patient Equity Hub');
    expect(el.textContent).toContain('5 Diverse Demographic Archetypes Active');
    expect(component.health.cohorts().length).toBe(5);
  });

  it('2. Automatically generates FHIR R4 Bundle on creation', () => {
    const bundle = component.generatedBundle();
    expect(bundle).toBeTruthy();
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.entry.length).toBeGreaterThan(0);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(`FHIR R4 Bundle ID: ${bundle.id}`);
  });

  it('3. Switches cohort when a demographic archetype button is clicked', () => {
    healthService.selectCohort('cohort_maternal');
    fixture.detectChanges();

    expect(healthService.activeCohortId()).toBe('cohort_maternal');
    const active = healthService.selectedCohort();
    expect(active.demographicGroup).toBe('Maternal Health');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(active.name);
    expect(el.textContent).toContain('High-Risk OB/GYN');
  });

  it('4. Displays COPPA Safe Harbor Shield for Pediatric cohorts', () => {
    healthService.selectCohort('cohort_pediatric');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('FTC COPPA (16 C.F.R. § 312) & Guardian Proxy Shield');
    expect(el.textContent).toContain('0 (Blocked)');
    expect(el.textContent).toContain('0 Bytes');
    expect(el.textContent).toContain('Edge Only / 0 Voiceprints');
    expect(el.textContent).toContain('Proxy Verified');
  });

  it('5. Hides COPPA Shield for adult cohorts', () => {
    healthService.selectCohort('cohort_maternal');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('FTC COPPA (16 C.F.R. § 312)');
  });

  it('6. Generates new synthetic FHIR R4 bundle when generateFhirJson is called', () => {
    const previousId = component.generatedBundle().id;
    component.generateFhirJson();
    fixture.detectChanges();

    const newBundle = component.generatedBundle();
    expect(newBundle).toBeTruthy();
    expect(typeof component.getFormattedJson(newBundle)).toBe('string');
  });
});

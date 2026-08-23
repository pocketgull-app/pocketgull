import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NantucketTickRadarComponent } from './nantucket-tick-radar.component';
import { NantucketTickRadarService } from '../services/nantucket-tick-radar.service';
import { PatientStateService } from '../services/patient-state.service';

describe('NantucketTickRadarComponent Suite', () => {
  let component: NantucketTickRadarComponent;
  let fixture: ComponentFixture<NantucketTickRadarComponent>;
  let radarService: NantucketTickRadarService;

  beforeEach(async () => {
    // Mock navigator.clipboard if undefined in test environment
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined)
        },
        configurable: true,
        writable: true
      });
    }

    await TestBed.configureTestingModule({
      imports: [NantucketTickRadarComponent],
      providers: [NantucketTickRadarService, PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(NantucketTickRadarComponent);
    component = fixture.componentInstance;
    radarService = TestBed.inject(NantucketTickRadarService);
    fixture.detectChanges();
  });

  it('1. Initializes in clinical radar mode with hotspots and species choices', () => {
    expect(component.viewMode()).toBe('clinical');
    expect(radarService.hotspots().length).toBeGreaterThan(0);
  });

  it('2. Switches between Clinical Radar and Junior Storybook Passport modes', () => {
    component.viewMode.set('passport');
    fixture.detectChanges();
    expect(component.viewMode()).toBe('passport');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-nantucket-passport-storybook')).toBeTruthy();

    component.viewMode.set('clinical');
    fixture.detectChanges();
    expect(component.viewMode()).toBe('clinical');
  });

  it('3. Selects geographic hotspots and tick vector species', () => {
    component.selectHotspot('middle_moors');
    expect(radarService.selectedHotspotId()).toBe('middle_moors');

    component.setSpecies('ixodes_adult');
    expect(radarService.selectedSpecies()).toBe('ixodes_adult');
  });

  it('4. Toggles observed patient symptoms and recalculates Bayesian triage results', () => {
    // Initial state contains ['bulls_eye_erythema', 'fatigue_malaise']
    expect(radarService.reportedSymptoms()).toContain('bulls_eye_erythema');

    // Toggle off
    component.toggleSymptom('bulls_eye_erythema');
    expect(radarService.reportedSymptoms()).not.toContain('bulls_eye_erythema');

    // Toggle back on
    component.toggleSymptom('bulls_eye_erythema');
    expect(radarService.reportedSymptoms()).toContain('bulls_eye_erythema');

    const lyme = radarService.bayesianTriageResults().find(r => r.pathogenId === 'lyme_borrelia');
    expect(lyme?.posteriorPercent).toBeGreaterThan(80);
  });

  it('5. Generates and copies FHIR R4 Bundle to clipboard', () => {
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    component.copyFhirBundle();
    expect(writeTextSpy).toHaveBeenCalled();
    expect(component.fhirCopied()).toBe(true);
  });
});

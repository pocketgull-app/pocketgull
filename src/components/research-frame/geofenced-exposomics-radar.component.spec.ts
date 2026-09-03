import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeofencedExposomicsRadarComponent } from './geofenced-exposomics-radar.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('GeofencedExposomicsRadarComponent Suite', () => {
  let component: GeofencedExposomicsRadarComponent;
  let fixture: ComponentFixture<GeofencedExposomicsRadarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeofencedExposomicsRadarComponent],
      providers: [PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(GeofencedExposomicsRadarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes GeofencedExposomicsRadarComponent with default Appalachian Shenandoah ecoregion', () => {
    expect(component).toBeTruthy();
    expect(component.selectedEcoregionId()).toBe('ECO-VA-SHENANDOAH');

    const selected = component.selectedEcoregion();
    expect(selected.name).toContain('Appalachian');
    expect(selected.stateCluster).toContain('UVA Health');
    expect(selected.aqi).toBeLessThanOrEqual(50);
  });

  it('2. Switches ecoregions and updates atmospheric telemetry', () => {
    component.selectedEcoregionId.set('ECO-PNW-CASCADES');
    fixture.detectChanges();

    const selected = component.selectedEcoregion();
    expect(selected.name).toContain('Pacific Northwest');
    expect(selected.pm25UgM3).toBe(4.2);
    expect(selected.waterPfasTier).toBe('NON_DETECT');
  });

  it('3. Emits selectQuery output when grounding research to exposome', () => {
    let emitted: { query: string; engine: 'pubmed' | 'gse' | 'google' } | undefined;
    component.selectQuery.subscribe((event) => {
      emitted = event;
    });

    component.selectedEcoregionId.set('ECO-VA-SHENANDOAH');
    component.groundResearchToExposome();

    expect(emitted).toBeDefined();
    expect(emitted?.engine).toBe('pubmed');
    expect(emitted?.query).toContain('Shenandoah');
  });
});

import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { GenderAffirmingLensTabComponent } from './gender-affirming-lens-tab.component';
import { GenderAffirmingCareService } from '../../services/gender-affirming-care.service';
import { SovereigntyHealthModelsService } from '../../services/sovereignty-health-models.service';

describe('GenderAffirmingLensTabComponent Unit Suite', () => {
  let component: GenderAffirmingLensTabComponent;
  let gacService: GenderAffirmingCareService;
  let sovereigntyService: SovereigntyHealthModelsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenderAffirmingLensTabComponent],
      providers: [
        GenderAffirmingCareService,
        SovereigntyHealthModelsService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(GenderAffirmingLensTabComponent);
    component = fixture.componentInstance;
    gacService = TestBed.inject(GenderAffirmingCareService);
    sovereigntyService = TestBed.inject(SovereigntyHealthModelsService);
  });

  it('1. Instantiates successfully with default inventory tab', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('inventory');
    expect(component.exportSuccessMessage()).toBeNull();
  });

  it('2. Reflects affirmed identity and organ inventory telemetry', () => {
    expect(component.gac.chosenName()).toBeDefined();
    expect(component.gac.affirmedPronouns()).toBeDefined();
    expect(component.gac.organInventory()).toBeDefined();
  });

  it('3. Computes GAHT evaluation and renal Cystatin-C based eGFR', () => {
    const renal = component.gac.renalEvaluation();
    expect(renal.cystatinCBasedEgfr).toBeGreaterThan(0);
    expect(renal.creatinineBasedEgfr).toBeGreaterThan(0);

    const gaht = component.gac.gahtEvaluation();
    expect(gaht).toBeDefined();
  });

  it('4. Switches between tabs (inventory, gaht, pk, renal)', () => {
    component.activeTab.set('gaht');
    expect(component.activeTab()).toBe('gaht');

    component.activeTab.set('pk');
    expect(component.activeTab()).toBe('pk');

    component.activeTab.set('renal');
    expect(component.activeTab()).toBe('renal');
  });

  it('5. Simulates GAHT PK curve in sovereignty service', () => {
    const pk = component.sovereignty.gahtPkSimulation();
    expect(pk).toBeDefined();
    expect(pk.simulatedCurve.length).toBeGreaterThan(0);
    expect(pk.peakConcentration).toBeGreaterThan(0);
  });

  it('6. Exports FHIR R4 Gender-Affirming Bundle with Restricted security code', () => {
    component.exportGenderAffirmingBundle();
    expect(component.exportSuccessMessage()).toContain('Restricted Zero-Egress Tag');
  });
});

import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { FaithTraditionConductCardComponent } from './faith-tradition-conduct-card.component';
import { SpiritualDietaryConductService } from '../../services/spiritual-dietary-conduct.service';
import { FastingChronobiologyTitrationService } from '../../services/fasting-chronobiology-titration.service';
import { CommunitySolidarityConnectorService } from '../../services/community-solidarity-connector.service';
import { CameraBarcodeDietaryExcipientScannerService } from '../../services/camera-barcode-dietary-excipient-scanner.service';

describe('FaithTraditionConductCardComponent Unit Suite', () => {
  let component: FaithTraditionConductCardComponent;
  let spiritualService: SpiritualDietaryConductService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaithTraditionConductCardComponent],
      providers: [
        SpiritualDietaryConductService,
        FastingChronobiologyTitrationService,
        CommunitySolidarityConnectorService,
        CameraBarcodeDietaryExcipientScannerService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(FaithTraditionConductCardComponent);
    component = fixture.componentInstance;
    spiritualService = TestBed.inject(SpiritualDietaryConductService);
  });

  it('1. Instantiates successfully with all traditions list and active rule', () => {
    expect(component).toBeTruthy();
    expect(component.allTraditions.length).toBeGreaterThan(0);
    expect(component.activeRule()).toBeDefined();
    expect(component.auditResults().length).toBe(0);
  });

  it('2. Changes tradition and clears previous audits and titration', () => {
    const changeEvent = {
      target: { value: 'ISLAM_HALAL_TAYYIB' }
    } as unknown as Event;

    component.onTraditionChange(changeEvent);
    expect(component.selectedTradition()).toBe('ISLAM_HALAL_TAYYIB');
    expect(component.activeRule().traditionKey).toBe('ISLAM_HALAL_TAYYIB');
    expect(component.auditResults().length).toBe(0);
    expect(component.titrationPlan()).toBeNull();
  });

  it('3. Audits medication excipient against dietary and spiritual laws', () => {
    component.testExcipient('Porcine Gelatin Capsule');
    expect(component.auditResults().length).toBeGreaterThan(0);
  });

  it('4. Generates chronobiological fasting titration schedule', () => {
    component.generateFastingTitration();
    const plan = component.titrationPlan();
    expect(plan).toBeDefined();
    expect(plan?.adjustedMedications.length).toBeGreaterThan(0);
  });

  it('5. Scans barcode and evaluates verdict', () => {
    const upc = component.demoUpcs[0]?.upc || '011110038485';
    component.scanUpc(upc);
    expect(component.scannedVerdict()).toBeDefined();
  });

  it('6. Exports FHIR R4 spiritual consent and dietary bundle', () => {
    component.exportFhirBundle();
    const json = component.exportedJson();
    expect(json).toBeDefined();
    expect(json).toContain('resourceType');
    expect(json).toContain('Bundle');
  });
});

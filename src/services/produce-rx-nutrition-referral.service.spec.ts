import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ProduceRxNutritionReferralService } from './produce-rx-nutrition-referral.service';

describe('ProduceRxNutritionReferralService', () => {
  let service: ProduceRxNutritionReferralService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProduceRxNutritionReferralService]
    });
    service = TestBed.inject(ProduceRxNutritionReferralService);
  });

  it('should initialize successfully', () => {
    expect(service).toBeDefined();
  });

  it('should generate a valid FHIR R4 Produce Rx referral package', () => {
    const referral = service.generateProduceRxReferral({
      patientId: 'pat-sarah-gear',
      patientName: 'Sarah Gear',
      conditions: ['Autoimmune Polyarthritis', 'Microbiome Dysbiosis'],
      destinationCity: 'Ojai Valley',
      coopsAndMarkets: ['Rainbow Bridge Natural Food Co-op', 'Ojai Certified Farmers Market'],
      specialtyHeritageFoods: ['Ojai Pixie Tangerines', 'Cold-Pressed California Mission Olive Oil'],
      monthlyAllotmentUsd: 175
    });

    expect(referral.id).toBeDefined();
    expect(referral.voucherNumber).toContain('VOUCH-GUSNIP');
    expect(referral.patientName).toBe('Sarah Gear');
    expect(referral.monthlyAllotmentUsd).toBe(175);
    expect(referral.eligiblePrograms).toContain('GusNIP');
    expect(referral.eligiblePrograms).toContain('SNAP_Incentive');
    expect(referral.sha256Attestation).toMatch(/^sha256:[a-f0-9]{32}$/);

    // Verify FHIR R4 ServiceRequest
    const sr = referral.fhirServiceRequestJson;
    expect(sr.resourceType).toBe('ServiceRequest');
    expect(sr.status).toBe('active');
    expect(sr.intent).toBe('order');
    expect(sr.subject.display).toBe('Sarah Gear');
    expect(sr.code.text).toContain('Ojai Valley');

    // Verify FHIR R4 NutritionOrder
    const no = referral.fhirNutritionOrderJson;
    expect(no.resourceType).toBe('NutritionOrder');
    expect(no.patient.display).toBe('Sarah Gear');
    expect(no.oralDiet.instruction).toContain('Ojai Pixie Tangerines');
  });

  it('should compile referral into an official FHIR R4 Document Bundle', () => {
    const referral = service.generateProduceRxReferral({
      destinationCity: 'San Luis Obispo',
      coopsAndMarkets: ['SLO Natural Foods Co-op'],
      specialtyHeritageFoods: ['Central Coast Artichokes']
    });

    const bundle = service.createFhirR4ReferralBundle(referral);
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');
    expect(bundle.entry.length).toBe(2);
    expect(bundle.entry[0].resource.resourceType).toBe('ServiceRequest');
    expect(bundle.entry[1].resource.resourceType).toBe('NutritionOrder');
  });
});

import { TestBed } from '@angular/core/testing';
import { WhoEssentialMedicinesService, WHO_ESSENTIAL_MEDICINES_CATALOG } from './who-essential-medicines.service';

describe('WhoEssentialMedicinesService', () => {
  let service: WhoEssentialMedicinesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WhoEssentialMedicinesService]
    });
    service = TestBed.inject(WhoEssentialMedicinesService);
  });

  it('should be created and expose WHO EML catalog', () => {
    expect(service).toBeTruthy();
    const all = service.getAllEssentialMedicines();
    expect(all.length).toBeGreaterThanOrEqual(20);
    expect(all.some(m => m.name === 'Amoxicillin')).toBe(true);
    expect(all.some(m => m.name.includes('Oral Rehydration Salts'))).toBe(true);
  });

  it('should filter medicines by clinical category', () => {
    const antibiotics = service.getByCategory('ANTIBIOTIC');
    expect(antibiotics.length).toBeGreaterThan(0);
    expect(antibiotics.every(a => a.category === 'ANTIBIOTIC')).toBe(true);

    const cvd = service.getByCategory('CARDIOVASCULAR');
    expect(cvd.some(m => m.name.includes('Amlodipine'))).toBe(true);
  });

  it('should search medicines by query', () => {
    const results = service.searchMedicines('malaria');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('Artemether');

    const insulin = service.searchMedicines('Insulin');
    expect(insulin.length).toBeGreaterThan(0);
    expect(insulin[0].category).toBe('ENDOCRINE_DIABETES');
  });

  it('should audit commercial prescriptions and calculate universal open formulary savings', () => {
    const patientRegimen = ['Brand Amoxicillin (Augmentin)', 'Humulin Regular Insulin', 'Norvasc (Amlodipine 5mg)', 'ProAir HFA Inhaler'];
    const audit = service.auditPrescriptionRegimen(patientRegimen);

    expect(audit.auditedCount).toBe(4);
    expect(audit.estimatedRetailOutOfPocketTotalUsd).toBeGreaterThan(400); // 38 + 285 + 42 + 74 = $439
    expect(audit.totalMonthlyMonopolyCostUsd).toBeGreaterThan(400); // Backwards-compatibility
    expect(audit.totalMonthlyEssentialCostUsd).toBeLessThan(10); // $0.90 + $4.50 + $0.60 + $0.60 = $6.60
    expect(audit.netMonthlySavingsUsd).toBeGreaterThan(390);
    expect(audit.netAnnualSavingsUsd).toBeGreaterThan(4500);
    expect(audit.universalAccessTier).toBe('HIGHLY_ACCESSIBLE (<$15/mo)');
    expect(audit.clinicalSummary).toContain('Estimated Out-of-Pocket Total');
    expect(audit.clinicalSummary).toContain('annual household financial toxicity relief');
  });

  it('should include open compounding monographs for offline/community production', () => {
    const ors = service.searchMedicines('Rehydration')[0];
    expect(ors.openCompoundingMonograph).toContain('Reduced Osmolarity Formula');
    expect(ors.openCompoundingMonograph).toContain('Sodium Chloride 2.6g');
    expect(ors.openCompoundingMonograph).toContain('Potassium Chloride 1.5g');
  });
});

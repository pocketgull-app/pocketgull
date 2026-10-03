import { describe, it, expect } from 'vitest';
import { IsmpClinicalGuard, ismpGuard } from '../src/index.js';

describe('@pocketgull/ismp-clinical-guard', () => {
  const guard = new IsmpClinicalGuard();

  it('1. Strips trailing zeros from medication dosages (ISMP Rule)', () => {
    expect(guard.sanitizeClinicalDosage('Administer Morphine 5.0 mg IV')).toContain('5 mg');
    expect(guard.sanitizeClinicalDosage('Give 10.00 mL oral solution')).toContain('10 mL');
    expect(guard.sanitizeClinicalDosage('Lisinopril 20.0 mg PO')).toContain('20 mg');
  });

  it('2. Prepends leading zero to naked decimals (ISMP Rule)', () => {
    expect(guard.sanitizeClinicalDosage('Administer .5 mg Clonazepam')).toContain('0.5 mg');
    expect(guard.sanitizeClinicalDosage('Titrate by .25 mcg')).toContain('0.25 mcg');
  });

  it('3. Replaces error-prone abbreviations from ISMP "Do Not Use" list', () => {
    expect(guard.sanitizeClinicalDosage('Regular Insulin 10 U sub q')).toContain('10 units subcutaneously');
    expect(guard.sanitizeClinicalDosage('Give MSO4 4 mg IV QD')).toContain('morPHINE sulfate');
    expect(guard.sanitizeClinicalDosage('Give MgSO4 2 g IV QOD')).toContain('magnesium sulfate 2 g IV every other day');
    expect(guard.sanitizeClinicalDosage('Synthroid 50 ug daily')).toContain('50 mcg daily');
  });

  it('4. Converts LASA medications to official FDA/ISMP Tall Man lettering', () => {
    expect(guard.formatTallMan('vinblastine')).toBe('vinBLAStine');
    expect(guard.formatTallMan('vincristine')).toBe('vinCRIStine');
    expect(guard.formatTallMan('hydralazine')).toBe('hydrALAZINE');
    expect(guard.formatTallMan('hydroxyzine')).toBe('hydrOXYzine');
    expect(guard.formatTallMan('cisplatin')).toBe('CISplatin');
    expect(guard.formatTallMan('carboplatin')).toBe('carboPLATIN');
  });

  it('5. Audits prescription notes and flags safety defects with clinical severity', () => {
    const dangerousNote = 'Order: vinblastine 5.0 mg IV QD. Also give .5 mg lorazepam QOD.';
    const audit = guard.auditPrescription(dangerousNote);

    expect(audit.isSafe).toBe(false);
    expect(audit.hasViolations).toBe(true);

    const trailingZero = audit.violations.find(v => v.type === 'TRAILING_ZERO');
    expect(trailingZero).toBeDefined();
    expect(trailingZero?.severity).toBe('CRITICAL_SAFETY_DEFECT');

    const nakedDecimal = audit.violations.find(v => v.type === 'NAKED_DECIMAL');
    expect(nakedDecimal).toBeDefined();

    const qdAbbrev = audit.violations.find(v => v.type === 'ERROR_PRONE_ABBREVIATION');
    expect(qdAbbrev).toBeDefined();

    const lasa = audit.violations.find(v => v.type === 'LOOK_ALIKE_SOUND_ALIKE');
    expect(lasa).toBeDefined();
    expect(lasa?.confusableWith).toBe('vinCRIStine');
    expect(lasa?.severity).toBe('CRITICAL_SAFETY_DEFECT');
  });

  it('6. Passes clean, safe prescription without violations', () => {
    const cleanNote = 'Administer Lisinopril 10 mg orally daily in the morning.';
    const audit = guard.auditPrescription(cleanNote);

    expect(audit.isSafe).toBe(true);
    expect(audit.violations.length).toBe(0);
  });

  it('7. Exports singleton instance for zero-config usage', () => {
    expect(ismpGuard.sanitizeClinicalDosage('5.0 mg')).toBe('5 mg');
  });
});

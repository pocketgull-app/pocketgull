import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WhoEssentialDiagnosticsService } from './who-essential-diagnostics.service';

describe('WhoEssentialDiagnosticsService (WHO EDL-4 Point-of-Care RDTs & Cold Chain Watchdog)', () => {
  let service: WhoEssentialDiagnosticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WhoEssentialDiagnosticsService]
    });
    service = TestBed.inject(WhoEssentialDiagnosticsService);
  });

  describe('1. Dual HIV / Syphilis Rapid Diagnostic Test', () => {
    it('should mandate Benzathine Penicillin G STAT for syphilis-reactive pregnant patient', () => {
      service.hivReactive.set(false);
      service.syphilisReactive.set(true);
      service.isPregnant.set(true);

      const res = service.hivSyphilisAssessment();
      expect(res.classification).toBe('SYPHILIS_MONO_REACTIVE');
      expect(res.acuityTier).toBe('RED');
      expect(res.clinicalAction).toContain('Benzathine Penicillin G 2.4 MU');
      expect(res.mandatoryFormulary).toContain('Benzathine Penicillin G 2.4 MU IM');
    });

    it('should flag DUAL_REACTIVE and initiate dual elimination bundle', () => {
      service.hivReactive.set(true);
      service.syphilisReactive.set(true);
      service.isPregnant.set(true);

      const res = service.hivSyphilisAssessment();
      expect(res.classification).toBe('DUAL_REACTIVE');
      expect(res.acuityTier).toBe('RED');
      expect(res.clinicalAction).toContain('prevention of mother-to-child transmission');
      expect(res.mandatoryFormulary.some(f => f.includes('TLD'))).toBe(true);
    });

    it('should return INVALID if control line fails', () => {
      service.hivSyphilisControl.set(false);
      const res = service.hivSyphilisAssessment();
      expect(res.classification).toBe('INVALID');
      expect(res.clinicalAction).toContain('Control line missing');
    });
  });

  describe('2. Malaria Pf / Pv Rapid Diagnostic Test', () => {
    it('should recommend Artemether-Lumefantrine for uncomplicated P. falciparum', () => {
      service.malariaPfHrp2.set(true);
      service.malariaPvLdh.set(false);
      service.malariaDangerSigns.set(false);

      const res = service.malariaAssessment();
      expect(res.speciesClassification).toBe('P_FALCIPARUM');
      expect(res.firstLineTherapy).toContain('Artemether 20mg / Lumefantrine 120mg');
      expect(res.g6pdWarningRequired).toBe(false);
    });

    it('should require Primaquine and G6PD warning for P. vivax', () => {
      service.malariaPfHrp2.set(false);
      service.malariaPvLdh.set(true);
      service.malariaDangerSigns.set(false);

      const res = service.malariaAssessment();
      expect(res.speciesClassification).toBe('P_VIVAX');
      expect(res.firstLineTherapy).toContain('Primaquine');
      expect(res.g6pdWarningRequired).toBe(true);
      expect(res.clinicalAction).toContain('G6PD test mandatory');
    });

    it('should elevate to RED and order parenteral Artesunate when danger signs are present', () => {
      service.malariaPfHrp2.set(true);
      service.malariaDangerSigns.set(true);

      const res = service.malariaAssessment();
      expect(res.acuityTier).toBe('RED');
      expect(res.firstLineTherapy).toContain('Parenteral Artesunate 2.4 mg/kg STAT');
    });
  });

  describe('3. Dengue NS1 & Ab Rapid Diagnostic Test', () => {
    it('should identify Acute Primary Dengue and enforce NSAID prohibition', () => {
      service.dengueNs1.set(true);
      service.dengueIgm.set(false);
      service.dengueIgg.set(false);
      service.dengueWarningSigns.set(false);

      const res = service.dengueAssessment();
      expect(res.infectionStage).toBe('ACUTE_PRIMARY');
      expect(res.contraindicatedMedications).toContain('Ibuprofen');
      expect(res.contraindicatedMedications).toContain('Aspirin');
      expect(res.clinicalAction).toContain('Paracetamol only');
    });

    it('should escalate to RED for Dengue with warning signs', () => {
      service.dengueNs1.set(true);
      service.dengueWarningSigns.set(true);

      const res = service.dengueAssessment();
      expect(res.acuityTier).toBe('RED');
      expect(res.clinicalAction).toContain('DENGUE WITH WARNING SIGNS');
    });
  });

  describe('4. Sickle Cell Disease Point-of-Care Lateral Flow', () => {
    it('should generate WHO preventive stepped bundle for HbSS Disease in toddler', () => {
      service.sicklePhenotype.set('HB_SS_DISEASE');
      service.sicklePatientAgeMonths.set(18);

      const res = service.sickleCellAssessment();
      expect(res.phenotypeResult).toBe('HB_SS_DISEASE');
      expect(res.acuityTier).toBe('RED');
      expect(res.preventiveBundle.some(b => b.includes('Penicillin V'))).toBe(true);
      expect(res.preventiveBundle.some(b => b.includes('Folic Acid'))).toBe(true);
      expect(res.preventiveBundle.some(b => b.includes('Pneumococcal'))).toBe(true);
      expect(res.preventiveBundle.some(b => b.includes('Hydroxyurea'))).toBe(true);
    });
  });

  describe('5. WHO Cold-Chain & Solar Microgrid Watchdog', () => {
    it('should report OPTIMAL storage between +2°C and +8°C', () => {
      service.updateColdChainTelemetry({ fridgeTempC: 4.2 });
      const cc = service.coldChainTelemetry();
      expect(cc.statusTier).toBe('OPTIMAL');
      expect(cc.statusLabel).toContain('Optimal');
    });

    it('should raise FREEZE_HAZARD alert with Shake Test when temp drops below 0°C', () => {
      service.updateColdChainTelemetry({ fridgeTempC: -1.2 });
      const cc = service.coldChainTelemetry();
      expect(cc.statusTier).toBe('FREEZE_HAZARD');
      expect(cc.actionGuidance).toContain('Shake Test');
    });

    it('should raise HEAT_EXCURSION alert when temp exceeds +8°C', () => {
      service.updateColdChainTelemetry({ fridgeTempC: 11.5 });
      const cc = service.coldChainTelemetry();
      expect(cc.statusTier).toBe('HEAT_EXCURSION');
      expect(cc.actionGuidance).toContain('VVM stickers');
    });

    it('should compute projected autonomous runtime hours from solar & battery', () => {
      service.updateColdChainTelemetry({ batterySocPct: 80, solarWattsM2: 700 });
      const cc = service.coldChainTelemetry();
      expect(cc.projectedAutonomyHours).toBeGreaterThan(20);
    });
  });
});

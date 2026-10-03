import { describe, it, expect, beforeEach } from 'vitest';
import { TcmAyurvedicIntegrativeService } from './tcm-ayurvedic-integrative.service';

describe('TcmAyurvedicIntegrativeService', () => {
  let service: TcmAyurvedicIntegrativeService;

  beforeEach(() => {
    service = new TcmAyurvedicIntegrativeService();
  });

  it('1. Initializes with default patterns, doshas, and catalogs', () => {
    expect(service.selectedTcmPattern()).toBe('Spleen Qi Deficiency with Dampness');
    expect(service.selectedAyurvedicDosha()).toBe('Vata-Pitta');
    expect(service.tcmFoodCatalog.length).toBeGreaterThan(0);
    expect(service.ayurvedicFoodCatalog.length).toBeGreaterThan(0);
    expect(service.herbDrugInteractionCatalog.length).toBeGreaterThan(0);
    expect(service.reproductiveProtocols.length).toBeGreaterThan(0);
  });

  it('2. Flags critical herb-drug interaction when patient is on Warfarin', () => {
    service.activePatientPrescriptions.set(['Warfarin']);
    const alerts = service.activeInteractions();
    expect(alerts.length).toBeGreaterThan(0);
    const danShen = alerts.find(a => a.herbName.includes('Dan Shen'));
    expect(danShen).toBeDefined();
    expect(danShen?.severity).toBe('CRITICAL_CONTRAINDICATION');
    expect(danShen?.mechanism).toContain('platelet aggregation');
  });

  it('3. Clears critical interaction when contraindicated prescription is removed', () => {
    service.activePatientPrescriptions.set(['Acetaminophen']);
    const alerts = service.activeInteractions();
    const danShen = alerts.find(a => a.herbName.includes('Dan Shen'));
    expect(danShen).toBeUndefined();
  });

  it('4. Filters food recommendations dynamically based on Spleen Qi pattern', () => {
    service.setTcmPattern('Spleen Qi Deficiency with Dampness');
    const foods = service.recommendedTcmFoods();
    expect(foods.length).toBeGreaterThan(0);
    foods.forEach(f => {
      const matchesSpleen = f.meridianTropism.includes('Spleen');
      const matchesDamp = f.clinicalActions.toLowerCase().includes('dampness');
      expect(matchesSpleen || matchesDamp).toBe(true);
    });
  });

  it('5. Generates bilingual grocery shopping manifest for Asian and Indian herbal markets', () => {
    const manifest = service.generateBilingualShoppingManifest();
    expect(manifest.length).toBeGreaterThan(0);
    const congee = manifest.find(m => m.english.includes('Congee'));
    expect(congee).toBeDefined();
    expect(congee?.traditionalOrSanskrit).toContain('稀饭');
    const kitchari = manifest.find(m => m.english.includes('Kitchari'));
    expect(kitchari).toBeDefined();
    expect(kitchari?.traditionalOrSanskrit).toContain('Khichdi');
  });

  it('6. Contains reproductive postpartum protocols for both TCM (Zuo Yue Zi) and Ayurveda (Sutika Paricharya)', () => {
    const protocols = service.reproductiveProtocols;
    const zuoYueZi = protocols.find(p => p.culturalTerm.includes('Sitting the Month'));
    expect(zuoYueZi).toBeDefined();
    expect(zuoYueZi?.safeNourishingFoods.length).toBeGreaterThan(0);

    const sutika = protocols.find(p => p.culturalTerm.includes('Maternal Rejuvenation'));
    expect(sutika).toBeDefined();
    expect(sutika?.coreInterventions.some(i => i.includes('Abhyanga'))).toBe(true);
  });
});

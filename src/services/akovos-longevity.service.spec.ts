import { AkovosLongevityService, AKOVOS_BOTANICALS, AKOVOS_SPRINGS } from './akovos-longevity.service';

describe('AkovosLongevityService Arcadian Pharmacopoeia & Biomechanics Suite', () => {
  let service: AkovosLongevityService;

  beforeEach(() => {
    service = new AkovosLongevityService();
  });

  it('1. Initializes with full Arcadian botanical pharmacopoeia including Taygetos Mountain Tea', () => {
    expect(service.botanicals().length).toBeGreaterThanOrEqual(5);
    const mountainTea = service.botanicals().find(b => b.id === 'sideritis-clandestina');
    expect(mountainTea).toBeDefined();
    expect(mountainTea?.greekName).toContain('Ταΰγετος');
    expect(mountainTea?.keyPhytochemicals).toContain('Apigenin');
    expect(mountainTea?.polyphenolContentMgG).toBeGreaterThan(40);
  });

  it('2. Exposes pure mountain spring profiles with zero microplastics and alkaline pH', () => {
    expect(service.springProfiles().length).toBe(2);
    for (const spring of service.springProfiles()) {
      expect(spring.microplasticCountPpm).toBe(0.0);
      expect(spring.waterPh).toBeGreaterThanOrEqual(8.0);
      expect(spring.magnesiumMgL).toBeGreaterThan(20);
    }
  });

  it('3. Computes accurate incline biomechanics and glucose disposal for Kalderimia stone walks', () => {
    const result = service.calculateInclineBiomechanics(75, 45, 18);
    expect(result.durationMinutes).toBe(45);
    expect(result.inclineGradePercent).toBe(18);
    expect(result.metabolicEquivalent).toBeGreaterThan(5.0);
    expect(result.estimatedCaloriesBurned).toBeGreaterThan(200);
    expect(result.postprandialGlucoseDropMgDl).toBeGreaterThan(25);
    expect(result.longevityZone2MinutesEarned).toBe(45);
  });

  it('4. Allows seamless botanical selection and reactive signal updates', () => {
    service.selectBotanical('arcadian-mountain-evoo');
    expect(service.selectedBotanical().id).toBe('arcadian-mountain-evoo');
    expect(service.selectedBotanical().keyPhytochemicals).toContain('Oleocanthal (>450 mg/kg)');
  });
});

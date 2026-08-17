import { TeledentistryService } from '../src/services/teledentistry.service';

describe('Teledentistry & Systemic Health Cross-Talk (SIBI Arena)', () => {
  let service: TeledentistryService;

  beforeEach(() => {
    service = new TeledentistryService();
  });

  it('1. Initializes full 32-tooth FDI international notation grid (Quadrants 1 to 4)', () => {
    const teeth = service.teeth();
    expect(teeth.length).toBe(32);

    const q1 = teeth.filter(t => t.quadrant === 1);
    const q2 = teeth.filter(t => t.quadrant === 2);
    const q3 = teeth.filter(t => t.quadrant === 3);
    const q4 = teeth.filter(t => t.quadrant === 4);

    expect(q1.length).toBe(8);
    expect(q2.length).toBe(8);
    expect(q3.length).toBe(8);
    expect(q4.length).toBe(8);

    // Verify key landmark molar teeth
    expect(teeth.find(t => t.fdiNumber === 16)?.name).toContain('Maxillary Right 1st Molar');
    expect(teeth.find(t => t.fdiNumber === 26)?.name).toContain('Maxillary Left 1st Molar');
    expect(teeth.find(t => t.fdiNumber === 36)?.name).toContain('Mandibular Left 1st Molar');
    expect(teeth.find(t => t.fdiNumber === 46)?.name).toContain('Mandibular Right 1st Molar');
  });

  it('2. Maps surface caries to standard M, O, D, F, L anatomical surfaces', () => {
    // Tooth 11 initial state
    const t11 = service.teeth().find(t => t.fdiNumber === 11);
    expect(t11?.cariesSurfaces).toEqual([]);

    // Toggle Occlusal and Mesial caries
    service.toggleSurface(11, 'O');
    service.toggleSurface(11, 'M');

    const updated = service.teeth().find(t => t.fdiNumber === 11);
    expect(updated?.cariesSurfaces).toContain('O');
    expect(updated?.cariesSurfaces).toContain('M');

    // Toggle off Mesial
    service.toggleSurface(11, 'M');
    const finalState = service.teeth().find(t => t.fdiNumber === 11);
    expect(finalState?.cariesSurfaces).toEqual(['O']);
  });

  it('3. Supports Smith & Knight Tooth Wear Index (TWI Grades 0 to 4)', () => {
    // Tooth 21: Set TWI Grade 3 (severe dentin loss > 1/3 surface area)
    service.setTWIGrade(21, 3);
    expect(service.teeth().find(t => t.fdiNumber === 21)?.twiGrade).toBe(3);

    // Tooth 21: Set TWI Grade 4 (pulp exposure)
    service.setTWIGrade(21, 4);
    expect(service.teeth().find(t => t.fdiNumber === 21)?.twiGrade).toBe(4);
  });

  it('4. Computes SIBI combining deep pockets (PPD >= 4mm), %BOP, and hs-CRP', () => {
    // Formula: SIBI = min(100, (Deep Pockets * 6) + (%BOP * 0.8) + (hs-CRP * 12))
    const deepPockets = service.deepPocketsCount();
    const bop = service.bleedingPercentage();
    const crp = service.hsCRP();
    const expected = Math.min(100, Math.round((deepPockets * 6) + (bop * 0.8) + (crp * 12)));

    expect(service.sibiScore()).toBe(expected);
  });

  it('5. Computes Cardiovascular Risk Multiplier (1.0x to 2.8x) & HbA1c elevation trajectory', () => {
    const cvMultiplier = service.cvRiskMultiplier();
    const hba1cElevation = service.predictedHbA1cElevation();

    expect(cvMultiplier).toBeGreaterThanOrEqual(1.0);
    expect(cvMultiplier).toBeLessThanOrEqual(2.8);

    expect(hba1cElevation).toBeGreaterThanOrEqual(0.0);
    expect(hba1cElevation).toBeLessThanOrEqual(0.8);
  });
});

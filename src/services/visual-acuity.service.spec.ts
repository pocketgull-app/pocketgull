import { VisualAcuityService, TumblingEDirection } from './visual-acuity.service';

describe('VisualAcuityService Unit Suite', () => {
  let service: VisualAcuityService;

  beforeEach(() => {
    service = new VisualAcuityService();
  });

  it('should initialize with standardized ETDRS optotype lines', () => {
    expect(service.OPTOTYPE_LINES.length).toBeGreaterThanOrEqual(8);
    const line2020 = service.OPTOTYPE_LINES.find(l => l.snellenFraction === '20/20');
    expect(line2020).toBeDefined();
    expect(line2020?.logMarScore).toBe(0.0);
    expect(line2020?.decimalAcuity).toBe(1.0);
  });

  it('should correctly scale optotype pixel height based on viewing distance and screen density', () => {
    const line2020 = service.OPTOTYPE_LINES.find(l => l.snellenFraction === '20/20')!;
    // At 100 cm distance with 3.78 pixels/mm (96 DPI standard)
    const heightAt1Meter = service.calculateOptotypePixelHeight(line2020, 100, 3.78);
    expect(heightAt1Meter).toBeGreaterThan(4);

    // At 50 cm distance, height should be approximately half of 100 cm
    const heightAt50Cm = service.calculateOptotypePixelHeight(line2020, 50, 3.78);
    expect(heightAt50Cm).toBeLessThan(heightAt1Meter);
  });

  it('should generate randomized Tumbling E directions', () => {
    const directions = service.getRandomTumblingEDirections(10);
    expect(directions.length).toBe(10);
    const validDirections: TumblingEDirection[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    directions.forEach(d => {
      expect(validDirections).toContain(d);
    });
  });

  it('should evaluate 20/20 vision as normal with positive clinical summary', () => {
    const line2020Idx = service.OPTOTYPE_LINES.findIndex(l => l.snellenFraction === '20/20');
    const result = service.evaluateResults('OU', line2020Idx, 5, 5, false, false);

    expect(result.snellenFraction).toBe('20/20');
    expect(result.logMar).toBe(0.0);
    expect(result.accuracyPercentage).toBe(100);
    expect(result.plainEnglishSummary).toContain('20/20');
    expect(result.clinicalRecommendations.length).toBeGreaterThan(0);
  });

  it('should flag astigmatism and color deficiency in recommendations', () => {
    const line2040Idx = service.OPTOTYPE_LINES.findIndex(l => l.snellenFraction === '20/40');
    const result = service.evaluateResults('OD', line2040Idx, 4, 5, true, true);

    expect(result.astigmatismNoted).toBe(true);
    expect(result.colorVisionDeficiency).toBe(true);
    const recsJoined = result.clinicalRecommendations.join(' ');
    expect(recsJoined).toContain('Astigmatism');
    expect(recsJoined).toContain('color');
  });

  it('should contain valid Ishihara screening plates', () => {
    expect(service.ISHIHARA_PLATES.length).toBeGreaterThanOrEqual(4);
    const plate1 = service.ISHIHARA_PLATES[0];
    expect(plate1.correctAnswer).toBe('12');
  });
});

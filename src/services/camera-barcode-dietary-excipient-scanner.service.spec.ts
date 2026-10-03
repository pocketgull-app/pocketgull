import { describe, it, expect, beforeEach } from 'vitest';
import { CameraBarcodeDietaryExcipientScannerService } from './camera-barcode-dietary-excipient-scanner.service';
import { SpiritualDietaryConductService } from './spiritual-dietary-conduct.service';

describe('CameraBarcodeDietaryExcipientScannerService', () => {
  let scannerService: CameraBarcodeDietaryExcipientScannerService;
  let spiritualService: SpiritualDietaryConductService;

  beforeEach(() => {
    spiritualService = new SpiritualDietaryConductService();
    scannerService = new CameraBarcodeDietaryExcipientScannerService(spiritualService);
  });

  it('should initialize and provide demo UPC items', () => {
    const list = scannerService.getDemoUpcList();
    expect(list.length).toBeGreaterThanOrEqual(4);
    expect(list[0].upc).toBe('011110853401');
  });

  it('should flag porcine gelatin softgels as STRICT_PROHIBITION for Halal patient', () => {
    spiritualService.setTradition('ISLAM_HALAL_TAYYIB');
    const result = scannerService.evaluateBarcode('021200145829', []);
    expect(result.overallSafety).toBe('STRICT_PROHIBITION');
    expect(result.faithConductViolations.some(v => v.includes('Porcine gelatin'))).toBe(true);
  });

  it('should flag gluten in spelt crackers for gluten-allergic patient', () => {
    const result = scannerService.evaluateBarcode('038000139109', ['Gluten']);
    expect(result.overallSafety).toBe('STRICT_PROHIBITION');
    expect(result.allergenViolations.some(v => v.includes('Gluten'))).toBe(true);
  });

  it('should evaluate certified sunflower seed butter as SAFE for nut-allergic and kosher patient', () => {
    spiritualService.setTradition('JUDAISM_ORTHODOX_KOSHER');
    const result = scannerService.evaluateBarcode('049000050114', ['Peanuts', 'Tree Nuts']);
    expect(result.overallSafety).toBe('SAFE');
    expect(result.certificationsConfirmed).toContain('Certified Gluten-Free');
    expect(result.certificationsConfirmed).toContain('Certified Vegan');
  });

  it('should flag 10% ethanol liquid elixir for alcohol-abstinent LDS/Muslim patients', () => {
    spiritualService.setTradition('LATTER_DAY_SAINTS_WORD_OF_WISDOM');
    const result = scannerService.evaluateBarcode('076800551234', []);
    expect(result.overallSafety).toBe('STRICT_PROHIBITION');
    expect(result.faithConductViolations.some(v => v.includes('Ethanol') || v.includes('alcohol'))).toBe(true);
  });
});

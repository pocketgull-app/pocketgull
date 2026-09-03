import { BionicReadingService } from './bionic-reading.service';

describe('BionicReadingService', () => {
  let service: BionicReadingService;

  beforeEach(() => {
    service = new BionicReadingService();
  });

  it('should initialize with Bionic Reading disabled by default', () => {
    expect(service.isBionicReadingEnabled()).toBe(false);
  });

  it('should toggle Bionic Reading mode state', () => {
    service.toggleBionicReading();
    expect(service.isBionicReadingEnabled()).toBe(true);
    service.toggleBionicReading();
    expect(service.isBionicReadingEnabled()).toBe(false);
  });

  it('should bold initial 40-50% characters of standard words correctly', () => {
    const input = 'Clinical Research Strategy';
    const output = service.formatToBionicHtml(input);
    expect(output).toContain('<b>Clin</b>ical');
    expect(output).toContain('<b>Rese</b>arch');
    expect(output).toContain('<b>Stra</b>tegy');
  });

  it('should preserve leading and trailing punctuation, quotes, and parens with morpheme anchor', () => {
    const input = '(PHQ-9) "Cardiovascular" [Level A]';
    const output = service.formatToBionicHtml(input);
    expect(output).toContain('(<b>PH</b>Q-<b>9</b>)');
    expect(output).toContain('"<b>Cardio</b>vascular"');
    expect(output).toContain('[<b>Lev</b>el <b>A</b>]');
  });

  it('should anchor medical prefixes (brady-, tachy-, hyper-, hypo-, chole-) rather than naive character slicing', () => {
    // bradycardia (prefix: brady, 5 chars)
    expect(service.formatToBionicHtml('bradycardia')).toBe('<b>brady</b>cardia');

    // tachycardia (prefix: tachy, 5 chars)
    expect(service.formatToBionicHtml('tachycardia')).toBe('<b>tachy</b>cardia');

    // cholecystitis (prefix: chole, 5 chars vs naive 6 chars cholec)
    expect(service.formatToBionicHtml('cholecystitis')).toBe('<b>chole</b>cystitis');

    // hypotension (prefix: hypo, 4 chars vs naive 5 chars hypot)
    expect(service.formatToBionicHtml('hypotension')).toBe('<b>hypo</b>tension');

    // hypercholesterolemia (prefix: hypercholestero, 16 chars)
    expect(service.formatToBionicHtml('hypercholesterolemia')).toBe('<b>hypercholestero</b>lemia');
  });

  it('should apply ISMP Tall Man LASA formatting and highlight distinguishing syllables', () => {
    // hydroxyzine vs hydralazine
    const hydroxyzine = service.formatToBionicHtml('hydroxyzine');
    expect(hydroxyzine).toContain('hydr');
    expect(hydroxyzine).toContain('OXY');
    expect(hydroxyzine).toContain('zine');

    const hydralazine = service.formatToBionicHtml('hydralazine');
    expect(hydralazine).toContain('hydra');
    expect(hydralazine).toContain('LAZ');
    expect(hydralazine).toContain('ine');

    // prednisone vs prednisolone
    const prednisone = service.formatToBionicHtml('prednisone');
    expect(prednisone).toContain('predni');
    expect(prednisone).toContain('SONE');

    const prednisolone = service.formatToBionicHtml('prednisolone');
    expect(prednisolone).toContain('predniso');
    expect(prednisolone).toContain('LONE');
  });

  it('should compute Optimal Recognition Point (ORP) index accurately', () => {
    // Length <= 1 -> 0
    expect(BionicReadingService.calculateOrpIndex(1)).toBe(0);
    // Length 2..5 -> 1
    expect(BionicReadingService.calculateOrpIndex(4)).toBe(1);
    expect(BionicReadingService.calculateOrpIndex(5)).toBe(1);
    // Length 6..9 -> 2
    expect(BionicReadingService.calculateOrpIndex(6)).toBe(2);
    expect(BionicReadingService.calculateOrpIndex(9)).toBe(2);
    // Length 10..13 -> 3
    expect(BionicReadingService.calculateOrpIndex(11)).toBe(3);
    expect(BionicReadingService.calculateOrpIndex(13)).toBe(3);
    // Length >= 14 -> 4
    expect(BionicReadingService.calculateOrpIndex(14)).toBe(4);
    expect(BionicReadingService.calculateOrpIndex(20)).toBe(4);
  });

  it('should parse structured clinical tokens with center-foveal ORP offsets', () => {
    const token = service.parseClinicalToken('"bradycardia,"');
    expect(token.leadingPunct).toBe('"');
    expect(token.coreWord).toBe('bradycardia');
    expect(token.fixation).toBe('brady');
    expect(token.suffix).toBe('cardia');
    expect(token.trailingPunct).toBe(',"');
    expect(token.category).toBe('medical-morpheme');
    expect(token.orpIndex).toBe(3);
    expect(token.orpChar).toBe('d'); // bra[d]ycardia
    expect(token.leftOfOrp).toBe('bra');
    expect(token.rightOfOrp).toBe('ycardia');
    expect(token.holdMultiplier).toBe(1.25); // comma pause
  });

  it('should tokenize full clinical sentences for RSVP streaming', () => {
    const sentence = 'Patient presents with acute cholecystitis and predniSONE 20mg.';
    const stream = service.tokenizeForRsvp(sentence);
    expect(stream.length).toBe(8);
    expect(stream[0].coreWord).toBe('Patient');
    expect(stream[4].category).toBe('medical-morpheme');
    expect(stream[4].coreWord).toBe('cholecystitis');
    expect(stream[6].category).toBe('medication-tallman');
    expect(stream[6].holdMultiplier).toBe(2.5); // High-risk safety deceleration
    expect(stream[7].holdMultiplier).toBe(1.6); // period pause
  });

  it('should apply 2.5x safety deceleration on ISMP Tall Man medications and 2.0x on clinical warnings', () => {
    const medToken = service.parseClinicalToken('hydrOXYzine');
    expect(medToken.category).toBe('medication-tallman');
    expect(medToken.holdMultiplier).toBe(2.5);

    const warnToken = service.parseClinicalToken('contraindicated');
    expect(warnToken.category).toBe('clinical-warning');
    expect(warnToken.holdMultiplier).toBe(2.0);
  });

  it('should support custom Tailwind CSS highlight classes', () => {
    const input = 'Clinical Strategy';
    const output = service.formatToBionicHtml(input, 'font-bold text-amber-600');
    expect(output).toContain('<strong class="font-bold text-amber-600">Clin</strong>ical');
    expect(output).toContain('<strong class="font-bold text-amber-600">Stra</strong>tegy');
  });

  it('should handle empty input gracefully', () => {
    expect(service.formatToBionicHtml('')).toBe('');
    expect(service.tokenizeForRsvp('')).toEqual([]);
  });

  it('should emit accessibility notice on state change', () => {
    service.toggleBionicReading();
    expect(service.accessibilityNotice()).toContain('enabled');
    service.toggleBionicReading();
    expect(service.accessibilityNotice()).toContain('disabled');
  });

  it('should set bionic reading explicitly', () => {
    service.setBionicReading(true);
    expect(service.isBionicReadingEnabled()).toBe(true);
    service.setBionicReading(false);
    expect(service.isBionicReadingEnabled()).toBe(false);
  });
});

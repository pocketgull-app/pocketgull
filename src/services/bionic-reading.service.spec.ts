import '@angular/compiler';
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

  it('should bold initial 40-50% characters of words correctly', () => {
    const input = 'Clinical Research Strategy';
    const output = service.formatToBionicHtml(input);
    expect(output).toContain('<b>Clin</b>ical');
    expect(output).toContain('<b>Rese</b>arch');
    expect(output).toContain('<b>Stra</b>tegy');
  });

  it('should preserve leading and trailing punctuation, quotes, and parens', () => {
    const input = '(PHQ-9) "Cardiovascular" [Level A]';
    const output = service.formatToBionicHtml(input);
    expect(output).toContain('(<b>PH</b>Q-<b>9</b>)');
    expect(output).toContain('"<b>Cardiov</b>ascular"');
    expect(output).toContain('[<b>Lev</b>el <b>A</b>]');
  });

  it('should support custom Tailwind CSS highlight classes', () => {
    const input = 'Clinical Strategy';
    const output = service.formatToBionicHtml(input, 'font-bold text-amber-600');
    expect(output).toContain('<strong class="font-bold text-amber-600">Clin</strong>ical');
    expect(output).toContain('<strong class="font-bold text-amber-600">Stra</strong>tegy');
  });

  it('should handle empty input gracefully', () => {
    expect(service.formatToBionicHtml('')).toBe('');
  });
});


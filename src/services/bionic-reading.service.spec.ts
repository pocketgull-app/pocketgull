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

  it('should bold initial 40% characters of words correctly', () => {
    const input = 'Clinical Research Strategy';
    const output = service.formatToBionicHtml(input);
    expect(output).toContain('<b>Clin</b>ical');
    expect(output).toContain('<b>Rese</b>arch');
    expect(output).toContain('<b>Stra</b>tegy');
  });

  it('should handle empty input gracefully', () => {
    expect(service.formatToBionicHtml('')).toBe('');
  });
});

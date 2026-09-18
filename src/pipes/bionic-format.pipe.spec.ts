import { TestBed } from '@angular/core/testing';
import { BionicFormatPipe } from './bionic-format.pipe';
import { BionicReadingService } from '../services/bionic-reading.service';

describe('BionicFormatPipe', () => {
  let pipe: BionicFormatPipe;
  let service: BionicReadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BionicFormatPipe, BionicReadingService]
    });
    pipe = TestBed.inject(BionicFormatPipe);
    service = TestBed.inject(BionicReadingService);
  });

  it('should return empty string when value is falsy', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return un-formatted plain text when Bionic Reading is disabled', () => {
    service.setBionicReading(false);
    const text = 'Clinical trial data';
    expect(pipe.transform(text)).toBe(text);
  });

  it('should return bionic HTML when Bionic Reading is enabled', () => {
    service.setBionicReading(true);
    const text = 'Clinical trial data';
    const result = pipe.transform(text);
    expect(result).toContain('<b>Clin</b>ical');
  });

  it('should support custom highlight class', () => {
    service.setBionicReading(true);
    const text = 'Clinical trial data';
    const result = pipe.transform(text, 'text-rose-500 font-extrabold');
    expect(result).toContain('<strong class="text-rose-500 font-extrabold">Clin</strong>ical');
  });
});

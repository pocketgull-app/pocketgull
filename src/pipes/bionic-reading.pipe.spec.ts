import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BionicReadingPipe } from './bionic-reading.pipe';
import { BionicReadingService } from '../services/bionic-reading.service';

describe('BionicReadingPipe', () => {
  let pipe: BionicReadingPipe;
  let service: BionicReadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BionicReadingPipe, BionicReadingService]
    });
    pipe = TestBed.inject(BionicReadingPipe);
    service = TestBed.inject(BionicReadingService);
  });

  it('should return original text when Bionic Reading is disabled', () => {
    service.setBionicReading(false);
    expect(pipe.transform('Patient Blood Pressure')).toBe('Patient Blood Pressure');
  });

  it('should return formatted bionic text when Bionic Reading is enabled', () => {
    service.setBionicReading(true);
    const result = pipe.transform('Patient Blood Pressure');
    expect(result).toContain('<b class="bionic-fixation">Pati</b>ent');
    expect(result).toContain('<b class="bionic-fixation">Blo</b>od');
    expect(result).toContain('<b class="bionic-fixation">Pres</b>sure');
  });

  it('should handle empty or null values gracefully', () => {
    service.setBionicReading(true);
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});

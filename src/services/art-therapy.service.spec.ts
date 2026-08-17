import '@angular/compiler';
import { ArtTherapyService } from './art-therapy.service';

describe('ArtTherapyService', () => {
  let service: ArtTherapyService;

  beforeEach(() => {
    service = new ArtTherapyService();
  });

  it('should initialize with art therapy prompts', () => {
    expect(service.artTherapyPrompts.length).toBe(3);
  });

  it('should map emerald green hex color to 528 Hz Solfeggio frequency', () => {
    const freq = service.getColorToFrequencyHz('#10B981');
    expect(freq).toBe(528);
  });

  it('should map blue hex color to 432 Hz Solfeggio frequency', () => {
    const freq = service.getColorToFrequencyHz('#3B82F6');
    expect(freq).toBe(432);
  });
});

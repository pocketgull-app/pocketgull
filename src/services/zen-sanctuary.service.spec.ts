import '@angular/compiler';
import { expect } from 'vitest';
import { ZenSanctuaryService } from './zen-sanctuary.service';

describe('ZenSanctuaryService Unit Suite', () => {
  let service: ZenSanctuaryService;

  beforeEach(() => {
    service = new ZenSanctuaryService();
  });

  it('1. Initializes in inactive state with default postcards', () => {
    expect(service.isSanctuaryActive()).toBe(false);
    expect(service.postcards().length).toBeGreaterThanOrEqual(4);
    expect(service.isKintsugiGlowActive()).toBe(true);
  });

  it('2. Opens and closes Sanctuary Mode safely', () => {
    service.openSanctuary();
    expect(service.isSanctuaryActive()).toBe(true);

    service.closeSanctuary();
    expect(service.isSanctuaryActive()).toBe(false);
  });

  it('3. Increments applause claps for community healing postcards', () => {
    const cardId = service.postcards()[0].id;
    const initialClaps = service.postcards()[0].clapsCount;

    service.clapForPostcard(cardId);
    const updated = service.postcards().find(c => c.id === cardId);
    expect(updated?.clapsCount).toBe(initialClaps + 1);
  });

  it('4. Allows posting a new anonymous community postcard', () => {
    const initialCount = service.postcards().length;
    service.sendPostcard({
      senderLocation: 'Seattle, WA',
      recoveryTopic: 'Mindfulness & Gratitude',
      message: 'Taking 3 quiet breaths right now.',
      artworkStyle: 'lavender_watercolor'
    });

    expect(service.postcards().length).toBe(initialCount + 1);
    expect(service.postcards()[0].senderLocation).toBe('Seattle, WA');
  });
});

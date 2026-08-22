import '@angular/compiler';
import { HelpfulListsService } from './helpful-lists.service';

describe('HelpfulListsService Unit Suite', () => {
  let service: HelpfulListsService;

  beforeEach(() => {
    service = new HelpfulListsService();
  });

  it('1. Initializes curated helpful quick-reference lists', () => {
    const lists = service.curatedLists();
    expect(lists.length).toBeGreaterThanOrEqual(5);

    const has988 = lists.some(item => item.id === 'list_988');
    expect(has988).toBe(true);
  });

  it('2. Filters curated lists by category', () => {
    const hotlines = service.getListsByCategory('EMERGENCY_HOTLINES');
    expect(hotlines.length).toBeGreaterThanOrEqual(3);
    expect(hotlines.every(item => item.category === 'EMERGENCY_HOTLINES')).toBe(true);

    const livingWills = service.getListsByCategory('PATIENT_RIGHTS_LIVING_WILLS');
    expect(livingWills.length).toBeGreaterThanOrEqual(2);
    expect(livingWills.every(item => item.category === 'PATIENT_RIGHTS_LIVING_WILLS')).toBe(true);

    const veterans = service.getListsByCategory('VETERANS_HEALTH_AND_BENEFITS');
    expect(veterans.length).toBeGreaterThanOrEqual(3);
    expect(veterans.every(item => item.category === 'VETERANS_HEALTH_AND_BENEFITS')).toBe(true);
    expect(veterans.some(item => item.id === 'list_va_lighthouse')).toBe(true);
    expect(veterans.some(item => item.id === 'list_va_pact')).toBe(true);
  });
});

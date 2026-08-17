import '@angular/compiler';
import { HtmlExportStrategyService } from './html-export-strategy.service';
import type { IPatient } from '../patient.types';

describe('HtmlExportStrategyService Suite', () => {
  const service = new HtmlExportStrategyService();

  const mockPatient: IPatient = {
    id: 'pt-html-1',
    name: 'Charles Babbage',
    age: 44,
    gender: 'Male',
    vitals: { hr: '68', bp: '115/75', spO2: '99', temp: '36.8', weight: '78', height: '178' },
    preexistingConditions: [],
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: 'Analytical Engine',
    lastVisit: '2026-08-05'
  };

  it('exposes printHtmlContent method for document printing', () => {
    expect(typeof service.printHtmlContent).toBe('function');
  });
});

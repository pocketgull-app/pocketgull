import '@angular/compiler';
import { PresentationExportService } from './presentation-export.service';
import { IPatient } from './patient.types';

describe('PresentationExportService - Grand Rounds & CARE Publication Suite', () => {
  let service: PresentationExportService;

  const mockPatient: IPatient = {
    id: 'p001',
    name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
    age: 58,
    gender: 'Male',
    lastVisit: '2026-08-19',
    preexistingConditions: ['Essential Hypertension', 'Type 2 Diabetes'],
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: '',
    medications: [],
    dietarySupplements: [],
    vitals: { bp: '148/92', hr: '76', spO2: '98%', temp: '36.6', weight: '82', height: '175' }
  };

  beforeEach(() => {
    service = new PresentationExportService();
  });

  it('1. Generates 7-slide Grand Rounds clinical presentation deck', () => {
    const deck = service.generateGrandRoundsDeck(mockPatient);
    expect(deck.slides.length).toBe(7);
    expect(deck.slides[0].category).toBe('Demographics');
    expect(deck.slides[4].category).toBe('Differential Radar');
    expect(deck.slides[5].category).toBe('N-of-1 Trial');
  });

  it('2. Formats CARE Guidelines-compliant Case Report in Markdown for Google Docs', () => {
    const deck = service.generateGrandRoundsDeck(mockPatient);
    expect(deck.careCaseReportMarkdown).toContain('CARE Guidelines');
    expect(deck.careCaseReportMarkdown).toContain('Pharmacogenomics');
    expect(deck.careCaseReportMarkdown).toContain('N-of-1 Crossover Trials');
  });

  it('3. Generates standalone HTML presentation deck string', () => {
    const deck = service.generateGrandRoundsDeck(mockPatient);
    expect(deck.rawHtmlPresentation).toContain('<!DOCTYPE html>');
    expect(deck.rawHtmlPresentation).toContain('Grand Rounds Presentation');
  });
});

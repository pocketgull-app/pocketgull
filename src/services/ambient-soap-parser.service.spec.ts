import { AmbientSoapParserService } from './ambient-soap-parser.service';

describe('AmbientSoapParserService (4-Paradigm Ambient Dialogue Structurer) Suite', () => {
  let service: AmbientSoapParserService;

  beforeEach(() => {
    service = new AmbientSoapParserService();
  });

  it('1. Parses raw conversational clinical transcript into a structured 4-paradigm SOAP note', () => {
    const transcript = 'Patient is a 45-year-old presenting with sharp right knee pain and swelling after playing tennis. Also notes high work stress, bloating after meals, poor sleep with racing thoughts, and chronic upper back stiffness from sitting.';
    const note = service.parseTranscript(transcript);

    expect(note.id).toBeDefined();
    expect(note.rawTranscript).toBe(transcript);

    // Subjective checks
    expect(note.subjective.western.length).toBeGreaterThan(0);
    expect(note.subjective.eastern.some(s => s.includes('energy') || s.includes('constraint'))).toBe(true);
    expect(note.subjective.ayurvedic.some(s => s.includes('Agni') || s.includes('sleep'))).toBe(true);
    expect(note.subjective.osteopathic.some(s => s.includes('postural') || s.includes('strain'))).toBe(true);

    // Objective checks
    expect(note.objective.western.length).toBeGreaterThan(0);
    expect(note.objective.eastern.some(s => s.includes('Tongue'))).toBe(true);
    expect(note.objective.ayurvedic.some(s => s.includes('Nadi'))).toBe(true);
    expect(note.objective.osteopathic.some(s => s.includes('TART'))).toBe(true);

    // Assessment checks
    expect(note.assessment.western.some(s => s.includes('ICD-10'))).toBe(true);
    expect(note.assessment.eastern.some(s => s.includes('Liver Qi'))).toBe(true);
    expect(note.assessment.ayurvedic.some(s => s.includes('Vata-Pitta'))).toBe(true);
    expect(note.assessment.osteopathic.some(s => s.includes('Somatic Dysfunction'))).toBe(true);

    // Plan checks
    expect(note.plan.western.some(s => s.includes('Physical Therapy'))).toBe(true);
    expect(note.plan.eastern.some(s => s.includes('Acupuncture'))).toBe(true);
    expect(note.plan.ayurvedic.some(s => s.includes('Abhyanga') || s.includes('Ahara'))).toBe(true);
    expect(note.plan.osteopathic.some(s => s.includes('OMT'))).toBe(true);
  });

  it('2. Formats structured SOAP note into clean markdown report', () => {
    const transcript = 'Routine follow up for blood pressure and wellness.';
    const note = service.parseTranscript(transcript);
    const md = service.formatAsMarkdown(note);

    expect(md).toContain('# 4-Paradigm Clinical SOAP Note');
    expect(md).toContain('## 1. Subjective (S)');
    expect(md).toContain('## 2. Objective (O)');
    expect(md).toContain('## 3. Assessment (A)');
    expect(md).toContain('## 4. Plan (P)');
  });
});

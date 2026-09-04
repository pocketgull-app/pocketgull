import { TestBed } from '@angular/core/testing';
import { DocDrillService } from './doc-drill.service';
import { SocraticJargonDictionaryService } from './socratic-jargon-dictionary.service';
import { PlainLanguageGlossaryService } from './plain-language-glossary.service';
import { ParquetKnowledgeDbService } from './parquet-knowledge-db.service';

describe('DocDrillService', () => {
  let service: DocDrillService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DocDrillService,
        SocraticJargonDictionaryService,
        PlainLanguageGlossaryService,
        ParquetKnowledgeDbService
      ]
    });
    service = TestBed.inject(DocDrillService);
  });

  it('should be created and start closed', () => {
    expect(service).toBeTruthy();
    expect(service.isOpen()).toBe(false);
    expect(service.activeTopic()).toBeNull();
    expect(service.persona()).toBe('clinician');
  });

  it('should open drill with Louise Sloan 5:1 optotype invariant topic', () => {
    service.openDrill('Louise Sloan 5:1 Invariant', { category: 'OPHTHALMOLOGY' });
    expect(service.isOpen()).toBe(true);
    expect(service.currentTitle()).toContain('Louise Sloan');
    expect(service.currentCategory()).toBe('OPHTHALMOLOGY');
    expect(service.currentBrief()).toContain('5:1 proportion');
    expect(service.currentChips().length).toBeGreaterThan(0);
  });

  it('should toggle persona between clinician and patient smoothly', () => {
    service.openDrill('Troponin', { category: 'BIOMARKER' });
    expect(service.currentBrief()).toContain('Myocardial Necrosis');

    service.setPersona('patient');
    expect(service.persona()).toBe('patient');
    expect(service.currentBrief()).toContain('Your Heart Muscle Protein');
  });

  it('should resolve Google Noto Sans and Amazon Ember lineage topics', () => {
    service.openDrill('Google Noto Sans');
    expect(service.currentTitle()).toContain('Google Noto');
    expect(service.currentBrief()).toContain('No more tofu');

    service.openDrill('Amazon Ember');
    expect(service.currentTitle()).toContain('Amazon Ember');
    expect(service.currentBrief()).toContain('Dalton Maag');
  });

  it('should resolve Google PAIR Data Cards and Healthsheets citation', () => {
    service.openDrill('Google PAIR Data Cards');
    expect(service.currentTitle()).toContain('Google PAIR');
    expect(service.currentBrief()).toContain('ACM FAccT');
  });

  it('should resolve ISMP safety disambiguation with slashed zero rules', () => {
    service.openDrill('ISMP Slashed Zero');
    expect(service.currentTitle()).toContain('ISMP');
    expect(service.currentBrief()).toContain('5.0 mg');
  });

  it('should resolve Socratic jargon dictionary terms', () => {
    service.openDrill('IRMAA');
    expect(service.currentTitle()).toContain('IRMAA');
    expect(service.currentCategory()).toBe('FINANCIAL');
  });

  it('should close drawer and update isOpen signal', () => {
    service.openDrill('Herman Bouma Crowding');
    expect(service.isOpen()).toBe(true);
    service.close();
    expect(service.isOpen()).toBe(false);
  });

  it('should generate local Socratic answer for follow-up questions', async () => {
    service.openDrill('Louise Sloan 5:1 Invariant');
    await service.askQuestion('Why is 5.0 mg banned?');
    expect(service.messages().length).toBeGreaterThanOrEqual(1);
    const userMsg = service.messages().find(m => m.sender === 'user');
    expect(userMsg?.content).toBe('Why is 5.0 mg banned?');
  });

  it('should resolve PEMDA+ pillars and supply columnar Parquet context chips', () => {
    service.openDrill('PEMDA+ Primary Intent');
    expect(service.currentTitle()).toContain('Primary Intent');
    expect(service.currentCategory()).toBe('PEMDA_PLUS');

    const contextChips = service.currentContextChips();
    expect(contextChips.length).toBeGreaterThan(0);
    expect(contextChips.some(c => c.type === 'deepDive' || c.type === 'pemda')).toBe(true);

    const stringChips = service.currentChips();
    expect(stringChips.length).toBeGreaterThan(0);
  });
});

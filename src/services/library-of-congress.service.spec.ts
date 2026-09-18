import { LibraryOfCongressService, LOC_HISTORICAL_MEDICAL_ARCHIVE } from './library-of-congress.service';
import { BionicReadingService } from './bionic-reading.service';
import { Injector, runInInjectionContext } from '@angular/core';

describe('LibraryOfCongressService Unit Suite', () => {
  let service: LibraryOfCongressService;
  let bionicService: BionicReadingService;

  beforeEach(() => {
    bionicService = new BionicReadingService();
    const injector = Injector.create({
      providers: [
        { provide: BionicReadingService, useValue: bionicService },
        LibraryOfCongressService
      ]
    });

    service = runInInjectionContext(injector, () => injector.get(LibraryOfCongressService));
  });

  it('1. Initializes with public domain historical medical archive', () => {
    expect(service).toBeTruthy();
    expect(LOC_HISTORICAL_MEDICAL_ARCHIVE.length).toBeGreaterThanOrEqual(4);
    const edwinSmith = LOC_HISTORICAL_MEDICAL_ARCHIVE.find(item => item.id === 'loc-edwin-smith-codex');
    expect(edwinSmith).toBeDefined();
    expect(edwinSmith?.lccn).toBe('30030538');
    expect(edwinSmith?.isPublicDomain).toBe(true);
  });

  it('2. Searches curated historical medical texts offline without throwing', async () => {
    const results = await service.searchHistoricalMedicalTexts('nursing');
    expect(results.items.length).toBeGreaterThanOrEqual(1);
    expect(results.items[0].title).toContain('Notes on Nursing');
    expect(results.items[0].authors).toContain('Florence Nightingale');
    expect(results.items[0].lccClass).toBe('RT40');
  });

  it('3. Resolves clinical query terms to canonical LCSH URIs and LCC classifications', () => {
    const cardio = service.resolveSubjectHeading('cardiovascular');
    expect(cardio.uri).toContain('id.loc.gov');
    expect(cardio.prefLabel).toContain('Cardiovascular');
    expect(cardio.lccClass).toBe('RC666-RC701');

    const renal = service.resolveSubjectHeading('renal clearance');
    expect(renal.prefLabel).toContain('Kidneys');
    expect(renal.category).toBe('clinical_medicine');

    const biblio = service.resolveSubjectHeading('bibliotherapy reading');
    expect(biblio.prefLabel).toBe('Bibliotherapy');
    expect(biblio.lccClass).toBe('RC489.B48');

    const posology = service.resolveSubjectHeading('posology dosing');
    expect(posology.prefLabel).toContain('Drugs--Dosage (Posology)');
    expect(posology.lccClass).toBe('RM145');
  });

  it('4. Converts Library of Congress search item into Bionic Reading study passage with ORP fixation', () => {
    const item = LOC_HISTORICAL_MEDICAL_ARCHIVE[0];
    const passage = service.convertToBionicPassage(item);

    expect(passage.title).toBe(item.title);
    expect(passage.wordCount).toBeGreaterThan(10);
    expect(passage.readingTimeSeconds450Wpm).toBeGreaterThanOrEqual(1);
    expect(passage.bionicHtml).toContain('bionic-fixation');
    expect(passage.bionicHtml).toContain('<strong');
    expect(passage.plainText).toContain(item.title);
  });
});

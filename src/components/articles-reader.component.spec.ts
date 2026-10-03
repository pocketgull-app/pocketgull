import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticlesReaderComponent } from './articles-reader.component';
import { WordPressArticlesService } from '../services/wordpress-articles.service';
import { BionicReadingService } from '../services/bionic-reading.service';

describe('ArticlesReaderComponent', () => {
  let component: ArticlesReaderComponent;
  let fixture: ComponentFixture<ArticlesReaderComponent>;
  let bionicService: BionicReadingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlesReaderComponent],
      providers: [WordPressArticlesService, BionicReadingService]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticlesReaderComponent);
    component = fixture.componentInstance;
    bionicService = TestBed.inject(BionicReadingService);
    fixture.detectChanges();
  });

  it('1. Initializes with standard reading level and seed WordPress articles', () => {
    expect(component.posts().length).toBeGreaterThan(0);
    expect(component.readingLevel()).toBe('standard');
    expect(component.activePost()).not.toBeNull();
  });

  it('2. Switches to 6th Grade plain-language reading level', () => {
    component.readingLevel.set('grade6');
    fixture.detectChanges();
    expect(component.readingLevel()).toBe('grade6');
    const formatted = component.formattedBody();
    expect(formatted).toBeTruthy();
  });

  it('3. Formats article body in Bionic Reading mode with bold fixations', () => {
    bionicService.setBionicReading(true);
    fixture.detectChanges();
    expect(component.isBionicMode()).toBe(true);
    const bionicOutput = component.formattedBody();
    expect(bionicOutput).toContain('text-amber-300 font-extrabold');
  });

  it('4. Renders Chronological Action Matrix across Present, Short-Term, and Long-Term timelines', () => {
    const post = component.activePost();
    expect(post?.chronologicalActionMatrix).toBeDefined();
    const cam = post!.chronologicalActionMatrix!;
    
    component.activeTimelineTab.set('present');
    expect(component.getActiveActionStage(cam)?.title).toBeTruthy();
    
    component.activeTimelineTab.set('shortTerm');
    expect(component.getActiveActionStage(cam)?.timeline).toContain('Week');
    
    component.activeTimelineTab.set('longTerm');
    expect(component.getActiveActionStage(cam)?.timeline).toContain('Year');
  });

  it('5. Exposes medical inventions and luminary spotlight for the article', () => {
    const post = component.activePost();
    expect(post?.medicalInvention).toBeDefined();
    expect(post?.medicalInvention?.inventorName).toBeTruthy();
    expect(post?.medicalInvention?.yearInvented).toBeGreaterThan(1700);
  });

  it('6. Exposes peer-reviewed empirical evidence with DOIs and statistical metrics', () => {
    const post = component.activePost();
    expect(post?.empiricalEvidence).toBeDefined();
    expect(post?.empiricalEvidence?.citations.length).toBeGreaterThan(0);
    expect(post?.empiricalEvidence?.citations[0].doi).toContain('10.');
    expect(post?.empiricalEvidence?.stats.length).toBeGreaterThan(0);
  });

  it('7. Renders Salutogenic Nutrition, Amazon Pharmacy Rx Benchmarks, and Restorative Hobbies', () => {
    // Select Article 103 (the-100000-dollar-oil-change)
    component.selectArticle('the-100000-dollar-oil-change');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    // 1. Salutogenic Nutrition & Whole Foods
    expect(compiled.textContent).toContain('Salutogenic Nutrition');
    expect(compiled.textContent).toContain('Whole Foods Market 365 Organic Staples');
    expect(compiled.textContent).toContain('365 Whole Foods Market Organic Cold-Pressed Extra Virgin Olive Oil');

    // 2. Supportive Equipment & Amazon Pharmacy Rx Benchmarks
    expect(compiled.textContent).toContain('Supportive Tools & Amazon Pharmacy Generic Rx Benchmarks');
    expect(compiled.textContent).toContain('FTC Affiliate Disclosure:');
    expect(compiled.textContent).toContain('Lisinopril Tablets');
    expect(compiled.textContent).toContain('$4.00 / month');

    // 3. Restorative Hobbies
    expect(compiled.textContent).toContain('Complementary Restorative Hobbies & Salutogenic Pacing');
    expect(compiled.textContent).toContain('Horticultural Therapy & Micro-Gardening');
    expect(compiled.textContent).toContain('Mindful Japanese Suminagashi');
  });

  it('8. Renders Physician Conversation Guide & 1-Page Encounter Brief (Shared Decision-Making)', () => {
    // Select Article 102 (cardiovascular-intimacy-safety-princeton-iii)
    component.selectArticle('cardiovascular-intimacy-safety-princeton-iii');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Physician Conversation Guide');
    expect(compiled.textContent).toContain('Shared Decision-Making');
    expect(compiled.textContent).toContain('Target Specialty:');
    expect(compiled.textContent).toContain('Cardiologist / Primary Care Physician');
    expect(compiled.textContent).toContain('60-Second SBAR Clinician Brief');
    expect(compiled.textContent).toContain('Princeton Consensus III');

    const article = component.activePost();
    expect(article?.physicianDiscussionGuide).toBeDefined();
    expect(article?.physicianDiscussionGuide?.discussionPrompts.length).toBeGreaterThanOrEqual(2);

    // Copy action test
    component.copyAllDoctorQuestions(article!.physicianDiscussionGuide!);
    expect(component.isQuestionsCopied()).toBe(true);
  });

  it('9. Switches article language to Spanish and Mandarin with translated title and content', async () => {
    component.selectArticle('cardiovascular-intimacy-safety-princeton-iii');
    fixture.detectChanges();

    // Default English
    expect(component.selectedLanguageCode()).toBe('en');
    expect(component.displayTitle()).toContain('2-Flight-of-Stairs');

    // Switch to Spanish (es)
    await component.onLanguageSelect('es');
    fixture.detectChanges();
    expect(component.selectedLanguageCode()).toBe('es');
    expect(component.displayTitle()).toContain('La Regla de los 2 Tramos de Escaleras');
    expect(component.formattedBody()).toContain('Consenso de Princeton III');

    // Switch to Mandarin (zh)
    await component.onLanguageSelect('zh');
    fixture.detectChanges();
    expect(component.selectedLanguageCode()).toBe('zh');
    expect(component.displayTitle()).toContain('两层楼梯安全法则');
    expect(component.formattedBody()).toContain('普林斯顿III共识指南');

    // Switch to Arabic (ar) for RTL verification
    await component.onLanguageSelect('ar');
    fixture.detectChanges();
    expect(component.isRtl()).toBe(true);
  });

  it('10. Enriches top articles (103, 104, 105, 108) with clinical discussion guides and SBAR briefs', () => {
    // Article 103: The $100,000 Oil Change (Kidney Prevention)
    component.selectArticle('the-100000-dollar-oil-change');
    fixture.detectChanges();
    let guide = component.activePost()?.physicianDiscussionGuide;
    expect(guide).toBeDefined();
    expect(guide?.recommendedSpecialty).toContain('Nephrologist');
    expect(guide?.discussionPrompts.some(p => p.id === 'ckd-q1')).toBe(true);

    // Article 104: Home Blood Pressure & ECG Guide
    component.selectArticle('home-blood-pressure-ecg-monitors-guide');
    fixture.detectChanges();
    guide = component.activePost()?.physicianDiscussionGuide;
    expect(guide).toBeDefined();
    expect(guide?.recommendedSpecialty).toContain('Cardiologist');
    expect(guide?.discussionPrompts.some(p => p.id === 'bp-q1')).toBe(true);

    // Article 105: Science of Sleep (Magnesium Glycinate)
    component.selectArticle('science-of-sleep-magnesium-glycinate');
    fixture.detectChanges();
    guide = component.activePost()?.physicianDiscussionGuide;
    expect(guide).toBeDefined();
    expect(guide?.recommendedSpecialty).toContain('Sleep Specialist');
    expect(guide?.discussionPrompts.some(p => p.id === 'sleep-q1')).toBe(true);

    // Article 108: Google Healthcare API & Clinical Models
    component.selectArticle('google-healthcare-api-clinical-models');
    fixture.detectChanges();
    guide = component.activePost()?.physicianDiscussionGuide;
    expect(guide).toBeDefined();
    expect(guide?.recommendedSpecialty).toContain('Informatics');
    expect(guide?.discussionPrompts.some(p => p.id === 'ai-q1')).toBe(true);
  });
});


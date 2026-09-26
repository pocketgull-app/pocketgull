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
});

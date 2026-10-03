import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnifiedParadigmSynthesizerComponent } from './unified-paradigm-synthesizer.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('UnifiedParadigmSynthesizerComponent', () => {
  let fixture: ComponentFixture<UnifiedParadigmSynthesizerComponent>;
  let component: UnifiedParadigmSynthesizerComponent;
  let mockPatientState: any;

  beforeEach(async () => {
    mockPatientState = {};

    await TestBed.configureTestingModule({
      imports: [UnifiedParadigmSynthesizerComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnifiedParadigmSynthesizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders 10-dimensional paradigm title and alignment score', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('10-Dimensional Unified Paradigm Health Vector');
    expect(el.textContent).toContain('94% Coherence');
    expect(component.alignmentScore()).toBe(94);
  });

  it('2. Renders all 10 domain suite vectors with correct names and icons', () => {
    const vectors = component.vectors();
    expect(vectors.length).toBe(10);

    const vectorIds = vectors.map(v => v.id);
    expect(vectorIds).toEqual([
      'biomedical',
      'therapeutics',
      'nutrition',
      'recovery',
      'turing',
      'nobel',
      'aaas',
      'lasker',
      'tcm',
      'ayurveda'
    ]);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Biomedical');
    expect(el.textContent).toContain('Turing Logic');
    expect(el.textContent).toContain('Nobel Evidence');
    expect(el.textContent).toContain('Lasker Model');
    expect(el.textContent).toContain('Eastern TCM');
    expect(el.textContent).toContain('Ayurvedic');
  });

  it('3. Renders core multimodal medical paradigm definitions list', () => {
    expect(component.paradigmList.length).toBeGreaterThan(0);
    const el = fixture.nativeElement as HTMLElement;
    for (const item of component.paradigmList) {
      expect(el.textContent).toContain(item.title);
    }
  });

  it('4. Updates alignment score signal and reflects in DOM', () => {
    component.alignmentScore.set(99);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('99% Coherence');
  });

  it('5. Allows modifying vector status and score dynamically', () => {
    component.vectors.update(vecs => vecs.map(v => v.id === 'turing' ? { ...v, score: 100, status: 'Formal Invariant Verified' } : v));
    fixture.detectChanges();

    const turing = component.vectors().find(v => v.id === 'turing');
    expect(turing?.score).toBe(100);
    expect(turing?.status).toBe('Formal Invariant Verified');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Formal Invariant Verified');
  });
});

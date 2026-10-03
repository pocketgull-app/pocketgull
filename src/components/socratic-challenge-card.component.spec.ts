import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocraticChallengeCardComponent } from './socratic-challenge-card.component';
import { ISocraticChallenge } from '../services/skeptical-epistemology.service';
import { signal } from '@angular/core';

describe('SocraticChallengeCardComponent', () => {
  let component: SocraticChallengeCardComponent;
  let fixture: ComponentFixture<SocraticChallengeCardComponent>;

  const mockChallenge: ISocraticChallenge = {
    id: 'sc-001',
    question: 'What is the first-line medication class for type 2 diabetes with high cardiovascular risk?',
    options: ['Sulfonylureas', 'SGLT2 inhibitors or GLP-1 RAs', 'Thiazolidinediones', 'DPP-4 inhibitors'],
    correctIndex: 1,
    explanation: 'SGLT2 inhibitors and GLP-1 receptor agonists offer proven cardioprotective benefits.',
    difficulty: 'analytical',
    epistemicTag: 'Cardio-Metabolic',
    lensName: 'Cardio-Metabolic Lens'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocraticChallengeCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SocraticChallengeCardComponent);
    component = fixture.componentInstance;
    (component as any).challenge = signal(mockChallenge);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Socratic Challenge card with question and difficulty badge', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Socratic Challenge');
    expect(el.textContent).toContain('analytical');
    expect(el.textContent).toContain('Cardio-Metabolic');
    expect(el.textContent).toContain(mockChallenge.question);
  });

  it('2. Renders all 4 options labeled A, B, C, D', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sulfonylureas');
    expect(el.textContent).toContain('SGLT2 inhibitors or GLP-1 RAs');
    expect(el.textContent).toContain('Thiazolidinediones');
    expect(el.textContent).toContain('DPP-4 inhibitors');
  });

  it('3. Selects correct option (index 1), reveals answer, and verifies isCorrect', () => {
    expect(component.isRevealed()).toBe(false);
    component.selectOption(1);
    fixture.detectChanges();

    expect(component.isRevealed()).toBe(true);
    expect(component.selectedIndex()).toBe(1);
    expect(component.isCorrect()).toBe(true);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Correct');
    expect(el.textContent).toContain(mockChallenge.explanation);
  });

  it('4. Selects incorrect option (index 0) and displays Learning Moment', () => {
    component.selectOption(0);
    fixture.detectChanges();

    expect(component.isRevealed()).toBe(true);
    expect(component.selectedIndex()).toBe(0);
    expect(component.isCorrect()).toBe(false);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Learning Moment');
  });

  it('5. Skips challenge and updates isSkipped state', () => {
    expect(component.isSkipped()).toBe(false);
    component.skip();
    fixture.detectChanges();

    expect(component.isSkipped()).toBe(true);
  });
});

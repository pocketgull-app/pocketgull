import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicalReasoningStreamComponent } from './clinical-reasoning-stream.component';
import { InteractionsProvider } from '../services/ai/interactions.provider';
import { signal } from '@angular/core';

describe('ClinicalReasoningStreamComponent', () => {
  let component: ClinicalReasoningStreamComponent;
  let fixture: ComponentFixture<ClinicalReasoningStreamComponent>;
  let mockInteractionsProvider: {
    thinkingBudget: ReturnType<typeof signal<number>>;
    setThinkingBudget: (budget: number) => void;
  };

  beforeEach(async () => {
    const budgetSig = signal(2048);
    mockInteractionsProvider = {
      thinkingBudget: budgetSig,
      setThinkingBudget: (b: number) => budgetSig.set(b)
    };

    await TestBed.configureTestingModule({
      imports: [ClinicalReasoningStreamComponent],
      providers: [
        { provide: InteractionsProvider, useValue: mockInteractionsProvider }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicalReasoningStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default thinking budget of 2048 and expanded state', () => {
    expect(component).toBeTruthy();
    expect(component.isExpanded()).toBe(true);
    expect(component.currentBudget()).toBe(2048);
  });

  it('2. Toggles expanded/collapsed state on user interaction', () => {
    component.toggleExpanded();
    expect(component.isExpanded()).toBe(false);

    component.toggleExpanded();
    expect(component.isExpanded()).toBe(true);
  });

  it('3. Updates thinking budget via preset selection', () => {
    component.setBudget(4096);
    expect(component.currentBudget()).toBe(4096);

    component.setBudget(0);
    expect(component.currentBudget()).toBe(0);
  });

  it('4. Clears thoughts stream and resets active status', () => {
    component.thoughts.set([
      {
        id: 'test-1',
        phase: 'HYPOTHESIS',
        phaseTitle: 'Hypothesis',
        thoughtSnippet: 'Test snippet',
        tokensConsumed: 100,
        timestamp: '12:00:00 PM'
      }
    ]);
    component.isReasoningActive.set(true);

    component.clearThoughts();
    expect(component.thoughts().length).toBe(0);
    expect(component.isReasoningActive()).toBe(false);
  });
});

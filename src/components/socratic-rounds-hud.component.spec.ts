import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SocraticRoundsHudComponent } from './socratic-rounds-hud.component';
import { SocraticRoundsService } from '../services/socratic-rounds.service';

describe('SocraticRoundsHudComponent', () => {
  let component: SocraticRoundsHudComponent;
  let fixture: ComponentFixture<SocraticRoundsHudComponent>;
  let roundsService: SocraticRoundsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocraticRoundsHudComponent],
      providers: [SocraticRoundsService]
    }).compileComponents();

    roundsService = TestBed.inject(SocraticRoundsService);
    fixture = TestBed.createComponent(SocraticRoundsHudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component with initial debate rounds state', () => {
    expect(component).toBeTruthy();
    expect(component.roundsService.debateMessages().length).toBeGreaterThan(0);
    expect(component.roundsService.differentialRankings().length).toBeGreaterThan(0);
    expect(component.userDirective).toBe('');
  });

  it('should render header with title, consensus tier, and case topic', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Autonomous Socratic Clinical Rounds');
    expect(compiled.textContent).toContain('Case:');
    expect(compiled.textContent).toContain('Complex Multi-Compartment Knee Arthralgia');
    expect(compiled.textContent).toContain('74.0%');
  });

  it('should render Socratic debate transcript with speaker badges and messages', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Rounds Director (AI CDS)');
    expect(compiled.textContent).toContain('Dr. Skeptic (Popperian CDS)');
    expect(compiled.textContent).toContain('Dr. Pragmatist (Functional MD)');
    expect(compiled.textContent).toContain('Case Presentation: 42yo presenting with medial joint-line pain');
    expect(compiled.textContent).toContain('H₀ p = 0.024');
    expect(compiled.textContent).toContain('Cochrane RoB: Low');
  });

  it('should render Differential Diagnostic Matrix with candidates and posterior probabilities', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Differential Diagnostic Matrix');

    const candidates = component.roundsService.differentialRankings();
    expect(candidates.length).toBeGreaterThan(0);
    expect(compiled.textContent).toContain(candidates[0].name);
    expect(compiled.textContent).toContain(candidates[0].icd10);
    expect(compiled.textContent).toContain('LR:');
  });

  it('should dispatch turn with user directive and clear input', () => {
    const advanceSpy = vi.spyOn(roundsService, 'advanceDebateRound');
    component.userDirective = 'Consider Pes Anserine Bursitis ultrasound evaluation';

    component.dispatchTurn();

    expect(advanceSpy).toHaveBeenCalledWith('Consider Pes Anserine Bursitis ultrasound evaluation');
    expect(component.userDirective).toBe('');
  });

  it('should dispatch turn with undefined when input is empty', () => {
    const advanceSpy = vi.spyOn(roundsService, 'advanceDebateRound');
    component.userDirective = '   ';

    component.dispatchTurn();

    expect(advanceSpy).toHaveBeenCalledWith(undefined);
    expect(component.userDirective).toBe('');
  });
});

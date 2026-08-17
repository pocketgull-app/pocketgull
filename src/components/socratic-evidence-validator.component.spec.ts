import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocraticEvidenceValidatorComponent } from './socratic-evidence-validator.component';
import { SocraticEvidenceLiteracyService } from '../services/socratic-evidence-literacy.service';

describe('SocraticEvidenceValidatorComponent', () => {
  let component: SocraticEvidenceValidatorComponent;
  let fixture: ComponentFixture<SocraticEvidenceValidatorComponent>;
  let service: SocraticEvidenceLiteracyService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocraticEvidenceValidatorComponent],
      providers: [SocraticEvidenceLiteracyService]
    }).compileComponents();

    fixture = TestBed.createComponent(SocraticEvidenceValidatorComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(SocraticEvidenceLiteracyService);
    fixture.detectChanges();
  });

  it('should create the socratic evidence validator component', () => {
    expect(component).toBeTruthy();
  });

  it('should perform initial analysis on creation', () => {
    const analysis = service.activeAnalysis();
    expect(analysis).toBeTruthy();
    expect(analysis?.evidenceTier).toContain('Level A');
  });

  it('should load preset claims and analyze them reactively', () => {
    component.loadPreset('Red wine reverses arterial aging.');
    fixture.detectChanges();

    const analysis = service.activeAnalysis();
    expect(analysis?.analyzedTopic).toBe('Resveratrol & Sirtuin Agonists');
    expect(analysis?.evidenceTier).toContain('Level C');
  });

  it('should emit close output', () => {
    let closed = false;
    component.close.subscribe(() => closed = true);

    component.close.emit();
    expect(closed).toBe(true);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BiomarkerVelocityCardComponent } from './biomarker-velocity-card.component';
import { BiomarkerVelocityService } from '../services/biomarker-velocity.service';
import { PatientStateService } from '../services/patient-state.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('BiomarkerVelocityCardComponent', () => {
  let component: BiomarkerVelocityCardComponent;
  let fixture: ComponentFixture<BiomarkerVelocityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiomarkerVelocityCardComponent],
      providers: [
        BiomarkerVelocityService,
        PatientStateService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock CDS response'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BiomarkerVelocityCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders BioTrajectory header and Gompertz-Makeham badge', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('BioTrajectory: Biomarker Velocity & Stealth Decay Radar');
    expect(el.textContent).toContain('Gompertz-Makeham');
    expect(el.textContent).toContain('Biological Reserve');
    expect(el.textContent).toContain('Hazard Multiplier');
  });

  it('2. Evaluates organ resilience score and hazard multiplier correctly', () => {
    const report = component.report();
    expect(report.organResilienceScore).toBeGreaterThan(0);
    expect(report.gompertzHazardMultiplier).toBeGreaterThan(0);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(`${report.organResilienceScore} / 100`);
    expect(el.textContent).toContain(`${report.gompertzHazardMultiplier}x`);
  });

  it('3. Renders stealth decay warning banner if stealth alerts exist', () => {
    const report = component.report();
    const el = fixture.nativeElement as HTMLElement;

    if (report.stealthAlertCount > 0) {
      expect(el.textContent).toContain('Stealth Organ Reserve Decay Alert Detected');
    }
  });

  it('4. Lists monitored biomarker cards with velocity rates and 5-year projections', () => {
    const report = component.report();
    expect(report.metrics.length).toBeGreaterThan(0);

    const el = fixture.nativeElement as HTMLElement;
    for (const metric of report.metrics.slice(0, 2)) {
      expect(el.textContent).toContain(metric.name);
      expect(el.textContent).toContain(metric.code);
      expect(el.textContent).toContain(metric.trajectoryStatus);
    }
  });

  it('5. Computes current patient demographics from state or fallback', () => {
    const p = component.currentPatient();
    expect(p.id).toBeDefined();
    expect(p.age).toBe(58);
    expect(p.gender).toBe('Male');
  });
});

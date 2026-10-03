import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutonomicBaroreflexCardComponent } from './autonomic-baroreflex-card.component';
import { AutonomicBaroreflexEngineService } from '../../services/autonomic-baroreflex-engine.service';

describe('AutonomicBaroreflexCardComponent (Clinical Model P10)', () => {
  let fixture: ComponentFixture<AutonomicBaroreflexCardComponent>;
  let component: AutonomicBaroreflexCardComponent;
  let service: AutonomicBaroreflexEngineService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutonomicBaroreflexCardComponent],
      providers: [AutonomicBaroreflexEngineService]
    }).compileComponents();

    fixture = TestBed.createComponent(AutonomicBaroreflexCardComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(AutonomicBaroreflexEngineService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders header, master phenotype badge, and 4 pillars', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Neurovascular Autonomic & Baroreflex Sensitivity Engine');
    expect(el.textContent).toContain('Hemodynamically Stable Orthostasis');
    expect(el.textContent).toContain('1. HRV Spectral Analysis');
    expect(el.textContent).toContain('2. Baroreflex Gain');
    expect(el.textContent).toContain('3. Orthostatic Challenge');
    expect(el.textContent).toContain('4. Vagal Tone Composite');
  });

  it('2. Applies Neurogenic OH preset and displays nOH badge with baroreflex failure alerts', () => {
    component.applyPreset('neurogenic_oh');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Neurogenic Orthostatic Hypotension (nOH)');
    expect(el.textContent).toContain('BRS Failure');
    expect(el.textContent).toContain('Sympathetic baroreflex failure detected');
    expect(service.orthostaticReport().orthostaticHypotensionPresent).toBe(true);
  });

  it('3. Applies POTS syndrome preset and displays excessive tachycardia directive', () => {
    component.applyPreset('pots_syndrome');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Postural Orthostatic Tachycardia Syndrome (POTS)');
    expect(el.textContent).toContain('Excessive orthostatic tachycardia');
    expect(service.orthostaticReport().deltaHrBpm).toBeGreaterThanOrEqual(30);
  });

  it('4. Applies Diabetic CAN preset and displays depressed BRS failure', () => {
    component.applyPreset('diabetic_autonomic_neuropathy');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('BRS Failure');
    expect(service.brsReport().brsGainMsMmHg).toBeLessThan(5.0);
    expect(service.compositeReport().vagalToneScore).toBeLessThan(30);
  });

  it('5. Applies Vagal Hypertonia preset and displays elevated vagal tone score', () => {
    component.applyPreset('vagal_hypertonia');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(service.compositeReport().vagalToneScore).toBeGreaterThanOrEqual(85);
    expect(el.textContent).toContain('Vagal Predominant');
  });

  it('6. Handles interactive slider modifications for SBP, HR, BRS, and RMSSD', () => {
    component.onStandSbpChange({ target: { value: '95' } } as unknown as Event);
    component.onStandHrChange({ target: { value: '75' } } as unknown as Event);
    component.onBrsChange({ target: { value: '4.5' } } as unknown as Event);
    component.onRmssdChange({ target: { value: '18' } } as unknown as Event);
    fixture.detectChanges();

    expect(service.standingSbpMmhg()).toBe(95);
    expect(service.standingHrBpm()).toBe(75);
    expect(service.brsGainMsMmHg()).toBe(4.5);
    expect(service.rmssdMs()).toBe(18);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('95 mmHg');
    expect(el.textContent).toContain('75 bpm');
    expect(el.textContent).toContain('4.5 ms/mmHg');
    expect(el.textContent).toContain('18 ms');
  });
});

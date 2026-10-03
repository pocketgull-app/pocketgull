import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KssCognitiveShieldComponent } from './kss-cognitive-shield.component';
import { PatientStateService } from '../services/patient-state.service';
import { AcronymExpanderService } from '../services/acronym-expander.service';
import { CircadianSleepinessService } from '../services/circadian-sleepiness.service';
import { signal } from '@angular/core';

describe('KssCognitiveShieldComponent', () => {
  let component: KssCognitiveShieldComponent;
  let fixture: ComponentFixture<KssCognitiveShieldComponent>;
  let mockPatientState: any;
  let mockAcronymService: any;
  let mockCircadianService: any;

  beforeEach(async () => {
    mockPatientState = {};
    mockAcronymService = {
      currentKssScore: signal(3)
    };
    mockCircadianService = {
      clinicianKss: signal(3),
      clinicianPass: signal(2)
    };

    await TestBed.configureTestingModule({
      imports: [KssCognitiveShieldComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: AcronymExpanderService, useValue: mockAcronymService },
        { provide: CircadianSleepinessService, useValue: mockCircadianService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(KssCognitiveShieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default Karolinska mode, KSS score 3, and Full Telemetry Mode', () => {
    expect(component).toBeTruthy();
    expect(component.scaleMode()).toBe('karolinska');
    expect(component.kssScore()).toBe(3);
    expect(component.passScore()).toBe(2);
    expect(component.cognitiveMode()).toBe('Full Telemetry Mode');
    expect(component.kssLevels.length).toBe(9);
    expect(component.passLevels.length).toBe(7);
  });

  it('2. Switches scale mode between Karolinska and Pennsylvania', () => {
    component.scaleMode.set('pennsylvania');
    fixture.detectChanges();
    expect(component.scaleMode()).toBe('pennsylvania');
    expect(component.cognitiveMode()).toBe('Full Telemetry Mode');

    component.scaleMode.set('karolinska');
    fixture.detectChanges();
    expect(component.scaleMode()).toBe('karolinska');
  });

  it('3. Updates KSS score and transitions cognitiveMode through alert, moderate, and high fatigue', () => {
    component.setKssScore(2);
    expect(component.kssScore()).toBe(2);
    expect(component.cognitiveMode()).toBe('Full Telemetry Mode');
    expect(mockAcronymService.currentKssScore()).toBe(2);

    component.setKssScore(5);
    expect(component.kssScore()).toBe(5);
    expect(component.cognitiveMode()).toBe('Simplified Focus Mode');
    expect(mockAcronymService.currentKssScore()).toBe(5);

    component.setKssScore(8);
    expect(component.kssScore()).toBe(8);
    expect(component.cognitiveMode()).toBe('Maximum Safety Shield Mode');
    expect(mockAcronymService.currentKssScore()).toBe(8);
  });

  it('4. Updates PASS score and synchronizes mapped KSS score and circadian telemetry', () => {
    component.scaleMode.set('pennsylvania');

    component.setPassScore(1);
    expect(component.passScore()).toBe(1);
    expect(component.kssScore()).toBe(1);
    expect(component.cognitiveMode()).toBe('Full Telemetry Mode');

    component.setPassScore(4);
    expect(component.passScore()).toBe(4);
    expect(component.kssScore()).toBe(5);
    expect(component.cognitiveMode()).toBe('Simplified Focus Mode');

    component.setPassScore(7);
    expect(component.passScore()).toBe(7);
    expect(component.kssScore()).toBe(9);
    expect(component.cognitiveMode()).toBe('Maximum Safety Shield Mode');
  });

  it('5. Dispatches custom window event on score change', () => {
    let capturedDetail: number | null = null;
    const listener = (e: Event) => {
      capturedDetail = (e as CustomEvent).detail;
    };
    window.addEventListener('kss-score-change', listener);

    component.setKssScore(6);
    expect(capturedDetail).toBe(6);

    window.removeEventListener('kss-score-change', listener);
  });
});

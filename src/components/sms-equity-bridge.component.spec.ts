import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { SmsEquityBridgeComponent } from './sms-equity-bridge.component';
import { SmsEquityBridgeService } from '../services/sms-equity-bridge.service';
import { PatientStateService } from '../services/patient-state.service';

describe('SmsEquityBridgeComponent', () => {
  let component: SmsEquityBridgeComponent;
  let fixture: ComponentFixture<SmsEquityBridgeComponent>;

  const mockPatientState = {
    asPatientSnapshot: () => ({
      id: 'p-equity-001',
      name: 'Jane Doe (Rural Health Cohort, 64y)',
      age: 64,
      gender: 'Female',
      lastVisit: '2026-09-12',
      preexistingConditions: ['Stage 1 Hypertension', 'Pre-Diabetes'],
      history: [],
      bookmarks: [],
      issues: {},
      patientGoals: 'Maintain morning BP < 130/80',
      medications: [{ name: 'Amlodipine 5mg', schedule: 'Morning' }],
      dietarySupplements: [],
      vitals: { bp: '134/86', hr: '72', spO2: '98%', temp: '36.7', weight: '70', height: '162' }
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsEquityBridgeComponent],
      providers: [
        SmsEquityBridgeService,
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SmsEquityBridgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component with initial default signals', () => {
    expect(component).toBeTruthy();
    expect(component.selectedLanguage()).toBe('en');
    expect(component.currentPatient().id).toBe('p-equity-001');
    expect(component.currentPatient().name).toContain('Jane Doe');
    expect(component.latestParsed()).not.toBeNull();
  });

  it('should render header HUD with title and reading grade level badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('SMS Compass: Health Equity SMS Bridge');
    expect(compiled.textContent).toContain('Grade Level:');
    expect(compiled.textContent).toContain('Target Line:');
  });

  it('should render daily outbound micro-interventions under 160 characters', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Outbound Micro-Interventions (<= 160 Chars)');
    expect(compiled.textContent).toContain('Morning (08:00)');
    expect(compiled.textContent).toContain('Afternoon (14:00)');
    expect(compiled.textContent).toContain('Evening (19:00)');
    expect(compiled.textContent).toContain('/160 chars');
  });

  it('should update prompt text when language is switched to Spanish', () => {
    component.selectedLanguage.set('es');
    fixture.detectChanges();

    const plan = component.plan();
    expect(plan.dailyPrompts[0].messageBody).toContain('¡Buenos días!');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('¡Buenos días!');
  });

  it('should simulate inbound SMS parsing and render parsed telemetry', () => {
    component.testInput.set('BP 128/82 HR 68 feel good');
    component.simulateSend();
    fixture.detectChanges();

    const parsed = component.latestParsed();
    expect(parsed).not.toBeNull();
    expect(parsed?.detectedVitals.bp).toBe('128/82');
    expect(parsed?.detectedVitals.hr).toBe(68);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Parsed Output');
    expect(compiled.textContent).toContain('Detected BP:');
    expect(compiled.textContent).toContain('128/82');
    expect(compiled.textContent).toContain('68 bpm');
  });

  it('should identify symptoms and emergency flags in patient text messages', () => {
    component.testInput.set('Severe chest pain radiating to left arm short of breath');
    component.simulateSend();
    fixture.detectChanges();

    const parsed = component.latestParsed();
    expect(parsed?.urgencyLevel).toBe('CRITICAL_CALL_911');
    expect(parsed?.automatedResponseText).toContain('911');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('CRITICAL_CALL_911');
  });

  it('should render recent inbound SMS history stream', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Recent SMS Ingestion Stream');
  });
});

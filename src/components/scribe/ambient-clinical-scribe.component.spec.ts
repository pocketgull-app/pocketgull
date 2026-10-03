import '@angular/compiler';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AmbientClinicalScribeComponent } from './ambient-clinical-scribe.component';
import { AmbientScribeService } from '../../services/ambient-scribe.service';

describe('AmbientClinicalScribeComponent Suite', () => {
  let component: AmbientClinicalScribeComponent;
  let fixture: ComponentFixture<AmbientClinicalScribeComponent>;
  let scribeService: AmbientScribeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbientClinicalScribeComponent],
      providers: [AmbientScribeService]
    }).compileComponents();

    fixture = TestBed.createComponent(AmbientClinicalScribeComponent);
    component = fixture.componentInstance;
    scribeService = TestBed.inject(AmbientScribeService);
    fixture.detectChanges();
  });

  it('1. Initializes with default SOAP tab and idle state', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('soap');
    expect(scribeService.isListening()).toBe(false);
  });

  it('2. Switches active tabs between SOAP, Socratic Demystifier, and 3-Act Trajectory', () => {
    component.activeTab.set('socratic');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('socratic');

    component.activeTab.set('trajectory');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('trajectory');
  });

  it('3. Populates Socratic inquiry questions and 5th-grade analogies upon scenario run', () => {
    scribeService.loadScenario('hypertension-fatigue');
    fixture.detectChanges();

    expect(scribeService.dialogueTurns().length).toBeGreaterThan(0);
    expect(scribeService.socraticQuestions().length).toBeGreaterThan(0);
    expect(scribeService.demystifiedJargon().length).toBeGreaterThan(0);
    expect(scribeService.naturalFrequencySummary()).toContain('Out of 100 people');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LensBiomolecularPhysicsComponent } from './lens-biomolecular-physics.component';
import { BiomolecularPhysicsService } from '../../services/biomolecular-physics.service';
import { PatientStateService } from '../../services/patient-state.service';

describe('LensBiomolecularPhysicsComponent', () => {
  let component: LensBiomolecularPhysicsComponent;
  let fixture: ComponentFixture<LensBiomolecularPhysicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LensBiomolecularPhysicsComponent],
      providers: [
        BiomolecularPhysicsService,
        PatientStateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LensBiomolecularPhysicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should default to the LLPS Phase Separation paradigm tab', () => {
    expect(component.activeTab()).toBe('llps');
    expect(component.llpsChi()).toBe(2.4);
  });

  it('should switch across all 4 molecular paradigm tabs', () => {
    component.activeTab.set('protac');
    expect(component.activeTab()).toBe('protac');

    component.activeTab.set('quantum');
    expect(component.activeTab()).toBe('quantum');

    component.activeTab.set('mof');
    expect(component.activeTab()).toBe('mof');

    component.activeTab.set('llps');
    expect(component.activeTab()).toBe('llps');
  });

  it('should compute PROTAC Hook effect curves and ternary state correctly', () => {
    component.activeTab.set('protac');
    fixture.detectChanges();

    const state = component.protacState();
    expect(state.ternaryComplexNm).toBeGreaterThan(0);
    expect(component.protacTernaryPath().length).toBeGreaterThan(10);
    expect(component.protacCurrentDotX()).toBeGreaterThan(0);
    expect(component.protacCurrentDotY()).toBeGreaterThan(0);
  });

  it('should compute Quantum Cryptochrome Bloch vector and yields correctly', () => {
    component.activeTab.set('quantum');
    component.quantumAngle.set(90);
    fixture.detectChanges();

    const qState = component.quantumState();
    expect(qState.singletYieldPhiS).toBeGreaterThan(0);
    expect(qState.tripletYieldPhiT).toBeGreaterThan(0);
    expect(component.quantumMagVectorX()).toBeCloseTo(75, 1);
  });

  it('should compute Reticular MOF moisture loading and SVG path correctly', () => {
    component.activeTab.set('mof');
    component.mofHumidity.set(40);
    fixture.detectChanges();

    const mof = component.mofState();
    expect(mof.adsorptionLoadingGramsPerGram).toBeGreaterThan(0);
    expect(component.mofIsothermPath().length).toBeGreaterThan(10);
    expect(component.mofDotX()).toBeGreaterThan(0);
  });

  it('should trigger LLPS stress granule perturbation', () => {
    component.triggerStressGranulePulse();
    expect(component.llpsChi()).toBe(2.8);
  });

  it('should trigger Tau hyperphosphorylation elevating fibril risk', () => {
    component.triggerTauHyperphosphorylation();
    expect(component.llpsChi()).toBe(3.2);
  });
});

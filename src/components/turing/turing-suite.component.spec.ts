import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { TuringSuiteComponent } from './turing-suite.component';
import { CellularAutomataViewerComponent } from './cellular-automata-viewer.component';
import { PetriNetViewerComponent } from './petri-net-viewer.component';
import { NavierStokesViewerComponent } from './navier-stokes-viewer.component';
import { PatientStateService } from '../../services/patient-state.service';
import { signal } from '@angular/core';

describe('TuringSuiteComponent - Turing-Complete Computational Diagnostic Suite', () => {
  let mockPatientState: any;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ bp: '120/80', hr: '74', spO2: '99', cgmGlucoseMgDl: '115' }),
      issues: signal({}),
      preexistingConditions: signal([])
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    });
  });

  it('should initialize TuringSuiteComponent successfully with patient vitals', () => {
    const component = TestBed.runInInjectionContext(() => new TuringSuiteComponent());
    expect(component).toBeTruthy();
    expect(component.patientVitals()).toEqual({ bp: '120/80', hr: '74', spO2: '99', cgmGlucoseMgDl: '115' });
  });

  describe('CellularAutomataViewerComponent', () => {
    it('should initialize with Conway B3/S23 preset and respond to presets', () => {
      const ca = TestBed.runInInjectionContext(() => new CellularAutomataViewerComponent());
      expect(ca).toBeTruthy();
      expect(ca.presets.length).toBe(4);
      expect(ca.activePreset().id).toBe('conway_b3s23');

      // Select HighLife preset
      ca.selectPreset(ca.presets[1]);
      expect(ca.activePreset().id).toBe('highlife_b36s23');
    });

    it('should sync with patient telemetry correctly', () => {
      const ca = TestBed.runInInjectionContext(() => new CellularAutomataViewerComponent());
      
      // Normal vitals -> Conway
      ca.syncWithPatientTelemetry();
      expect(ca.activePreset().id).toBe('conway_b3s23');

      // High glucose -> HighLife
      mockPatientState.vitals.set({ bp: '130/85', hr: '72', spO2: '98', cgmGlucoseMgDl: '180' });
      ca.syncWithPatientTelemetry();
      expect(ca.activePreset().id).toBe('highlife_b36s23');
    });

    it('should apply cytokine surge and antioxidant perturbations', () => {
      const ca = TestBed.runInInjectionContext(() => new CellularAutomataViewerComponent());
      ca.clearGrid();
      expect(ca.activeCellCount()).toBe(0);

      ca.injectCytokineStorm();
      expect(ca.activeCellCount()).toBeGreaterThan(0);

      ca.administerAntioxidantPulse();
      expect(ca.activeCellCount()).toBeGreaterThan(0);
    });
  });

  describe('PetriNetViewerComponent', () => {
    it('should initialize with Immunometabolic model and places', () => {
      const petri = TestBed.runInInjectionContext(() => new PetriNetViewerComponent());
      expect(petri).toBeTruthy();
      expect(petri.activeModelId()).toBe('immunometabolic');
      expect(petri.places().length).toBe(4);
      expect(petri.isDeadlocked()).toBe(false);
      expect(petri.totalTokens()).toBeGreaterThan(0);
    });

    it('should switch between Mitochondrial and Cardiometabolic models', () => {
      const petri = TestBed.runInInjectionContext(() => new PetriNetViewerComponent());
      
      // Switch to Mitochondrial
      petri.selectModel('mitochondrial');
      expect(petri.activeModelId()).toBe('mitochondrial');
      expect(petri.places().some(p => p.id === 'membrane_potential')).toBe(true);

      // Switch to Cardiometabolic
      petri.selectModel('cardiometabolic');
      expect(petri.activeModelId()).toBe('cardiometabolic');
      expect(petri.places().some(p => p.id === 'glut4_translocation')).toBe(true);
    });

    it('should fire enabled transitions and update token counts and trajectory history', () => {
      const petri = TestBed.runInInjectionContext(() => new PetriNetViewerComponent());
      const cascadeTransition = petri.transitions().find(t => t.id === 't_cascade')!;
      expect(cascadeTransition).toBeDefined();
      expect(petri.canFire(cascadeTransition)).toBe(true);

      const initialCytokines = petri.places().find(p => p.id === 'proinflammatory_cytokines')!.tokens;
      const initialLesions = petri.places().find(p => p.id === 'endothelial_damage')!.tokens;

      petri.fireTransition(cascadeTransition);
      expect(petri.stepCount()).toBe(1);

      const postCytokines = petri.places().find(p => p.id === 'proinflammatory_cytokines')!.tokens;
      const postLesions = petri.places().find(p => p.id === 'endothelial_damage')!.tokens;

      expect(postCytokines).toBe(initialCytokines - 1);
      expect(postLesions).toBe(initialLesions + 1);
    });

    it('should support Endotoxin, Hypoxia, VNS, Mitochondrial, and AMPK perturbations', () => {
      const petri = TestBed.runInInjectionContext(() => new PetriNetViewerComponent());
      
      // Endotoxin Surge
      petri.injectEndotoxinSurge();
      const stormTokens = petri.places().find(p => p.id === 'proinflammatory_cytokines')!.tokens;
      expect(stormTokens).toBeGreaterThanOrEqual(4);

      // Vagus Nerve Stimulation Rescue
      petri.injectVagusNerveStimulation();
      const tregTokens = petri.places().find(p => p.id === 'anti_inflammatory_treg')!.tokens;
      expect(tregTokens).toBeGreaterThan(0);

      // Hypoxic Stress
      petri.injectHypoxicStress();

      // Mitochondrial Cofactors
      petri.injectMitochondrialCofactor();

      // AMPK Activation
      petri.injectAmpkActivation();
      expect(petri.totalTokens()).toBeGreaterThan(0);
    });

    it('should calculate SVG arc path with curvature', () => {
      const petri = TestBed.runInInjectionContext(() => new PetriNetViewerComponent());
      const path = petri.getArcPath(50, 50, 200, 150);
      expect(path).toContain('M 50 50');
      expect(path).toContain('200 150');
    });

    it('should toggle place token directly on user click', () => {
      const petri = TestBed.runInInjectionContext(() => new PetriNetViewerComponent());
      const place = petri.places()[0];
      const initialTokens = place.tokens;
      
      petri.togglePlaceToken(place);
      expect(petri.places()[0].tokens).toBe((initialTokens + 1) % (place.maxCapacity + 1));
    });

    it('should sync patient metabolism based on elevated glucose', () => {
      const petri = TestBed.runInInjectionContext(() => new PetriNetViewerComponent());
      mockPatientState.vitals.set({ bp: '130/80', hr: '75', spO2: '99', cgmGlucoseMgDl: '185' });
      
      petri.syncPatientMetabolism();
      expect(petri.activeModelId()).toBe('cardiometabolic');
    });
  });

  describe('NavierStokesViewerComponent', () => {
    it('should compute velocity, expansion, and Reynolds number across sleep stages', () => {
      const ns = TestBed.runInInjectionContext(() => new NavierStokesViewerComponent());
      expect(ns).toBeTruthy();

      // N3 Stage
      ns.setSleepStage('n3');
      expect(ns.csfVelocity()).toBe('4.8');
      expect(ns.volumeExpansion()).toBe(60);
      expect(ns.reynoldsNumber()).toBe(142);

      // N2 Stage
      ns.setSleepStage('n2');
      expect(ns.csfVelocity()).toBe('2.1');
      expect(ns.volumeExpansion()).toBe(20);
      expect(ns.reynoldsNumber()).toBe(85);

      // Wake Stage
      ns.setSleepStage('wake');
      expect(ns.csfVelocity()).toBe('0.6');
      expect(ns.volumeExpansion()).toBe(0);
      expect(ns.reynoldsNumber()).toBe(24);
    });

    it('should induce slow wave deep sleep surge and pulse hypertension', () => {
      const ns = TestBed.runInInjectionContext(() => new NavierStokesViewerComponent());
      ns.setSleepStage('wake');
      expect(ns.sleepStage()).toBe('wake');

      ns.induceSlowWaveDeepSleep();
      expect(ns.sleepStage()).toBe('n3');

      ns.pulseHypertension();
      expect(ns.sleepStage()).toBe('n3');
    });
  });

  describe('TuringSuiteComponent Global Actions', () => {
    it('should execute Sympathetic Shock, Vagal Restoration, and Engine Sync', () => {
      const suite = TestBed.runInInjectionContext(() => new TuringSuiteComponent());
      
      suite.triggerSympatheticShock();
      expect(suite.lastActionStatus()).toContain('Sympathetic Shock');

      suite.triggerVagalRestoration();
      expect(suite.lastActionStatus()).toContain('Vagal Restoration');

      suite.syncAllEngines();
      expect(suite.lastActionStatus()).toContain('synchronized');
    });
  });
});

import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, signal } from '@angular/core';
import { PetriNetViewerComponent } from './petri-net-viewer.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('PetriNetViewerComponent Unit Suite', () => {
  let component: PetriNetViewerComponent;

  beforeEach(async () => {
    const mockState = {
      vitals: signal({ hr: '75', spO2: '98%' }),
      issues: signal({})
    };

    await TestBed.configureTestingModule({
      imports: [PetriNetViewerComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: PatientStateService, useValue: mockState }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PetriNetViewerComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with default immunometabolic model', () => {
    expect(component).toBeTruthy();
    expect(component.activeModelId()).toBe('immunometabolic');
    expect(component.places().length).toBeGreaterThan(0);
    expect(component.totalTokens()).toBeGreaterThan(0);
    expect(component.stepCount()).toBe(0);
  });

  it('2. Switches Petri Net models and reinitializes place tokens', () => {
    component.selectModel('mitochondrial');
    expect(component.activeModelId()).toBe('mitochondrial');
    expect(component.places().length).toBeGreaterThan(0);
    expect(component.stepCount()).toBe(0);

    component.selectModel('cardiometabolic');
    expect(component.activeModelId()).toBe('cardiometabolic');
  });

  it('3. Looks up places by ID accurately', () => {
    const places = component.places();
    const firstPlace = places[0];
    const retrieved = component.getPlaceById(firstPlace.id);
    expect(retrieved).toEqual(firstPlace);
  });

  it('4. Provides token sparkline history for places', () => {
    const places = component.places();
    const firstPlace = places[0];
    const hist = component.getPlaceHistory(firstPlace.id);
    expect(hist.length).toBeGreaterThan(0);
  });

  it('5. Computes transitions and deadlock status', () => {
    const transitions = component.transitions();
    expect(transitions.length).toBeGreaterThan(0);
    expect(typeof component.isDeadlocked()).toBe('boolean');
  });
});

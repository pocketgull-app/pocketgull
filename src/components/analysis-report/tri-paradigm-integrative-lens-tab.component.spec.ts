import '@angular/compiler';
import { expect, vi } from 'vitest';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TriParadigmIntegrativeLensTabComponent } from './tri-paradigm-integrative-lens-tab.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('TriParadigmIntegrativeLensTabComponent', () => {
  let component: TriParadigmIntegrativeLensTabComponent;
  let mockState: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockState = {
      bodyViewerMode: signal('3d'),
      activePhilosophy: signal('western'),
      selectPhilosophy: vi.fn((p) => mockState.activePhilosophy.set(p))
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockState }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new TriParadigmIntegrativeLensTabComponent();
    });
  });

  it('should instantiate successfully with default all view', () => {
    expect(component).toBeTruthy();
    expect(component.activeParadigmView()).toBe('all');
  });

  it('should switch paradigm view and sync 3D Body Viewer philosophy for TCM', () => {
    component.selectView('tcm');
    expect(component.activeParadigmView()).toBe('tcm');
    expect(mockState.bodyViewerMode()).toBe('3d');
    expect(mockState.activePhilosophy()).toBe('eastern');
  });

  it('should switch paradigm view and sync 3D Body Viewer philosophy for Ayurveda', () => {
    component.selectView('ayurveda');
    expect(component.activeParadigmView()).toBe('ayurveda');
    expect(mockState.bodyViewerMode()).toBe('3d');
    expect(mockState.activePhilosophy()).toBe('ayurvedic');
  });

  it('should switch paradigm view and sync 3D Body Viewer philosophy for Allopathic', () => {
    component.selectView('allopathic');
    expect(component.activeParadigmView()).toBe('allopathic');
    expect(mockState.bodyViewerMode()).toBe('3d');
    expect(mockState.activePhilosophy()).toBe('western');
  });

  it('should switch to 4-Way Quad matrix for all view', () => {
    component.selectView('all');
    expect(component.activeParadigmView()).toBe('all');
    expect(mockState.bodyViewerMode()).toBe('quad');
  });

  it('should render Wu Xing 5-element balances and Ayurvedic dosha metrics', () => {
    const tcm = component.tcmMetrics();
    expect(tcm.wood).toBeGreaterThan(0);
    expect(tcm.earth).toBeGreaterThan(0);
    expect(tcm.fire).toBeGreaterThan(0);
    expect(tcm.water).toBeGreaterThan(0);

    const ayurveda = component.ayurvedaMetrics();
    expect(ayurveda.vata).toBeGreaterThan(0);
    expect(ayurveda.pitta).toBeGreaterThan(0);
    expect(ayurveda.kapha).toBeGreaterThan(0);
  });
});
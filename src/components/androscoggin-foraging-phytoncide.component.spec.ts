import '@angular/compiler';
import * as DOMPurify from 'dompurify';
import { expect, vi } from 'vitest';
import { AndroscogginForagingPhytoncideComponent } from './androscoggin-foraging-phytoncide.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';

describe('AndroscogginForagingPhytoncideComponent — Terpene Phytoncide Suite', () => {
  let component: AndroscogginForagingPhytoncideComponent;
  let mockPatientState: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.stubGlobal('alert', vi.fn());
    mockPatientState = {
      addClinicalNote: vi.fn(),
      symptoms: signal([]),
      conditions: signal([])
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new AndroscogginForagingPhytoncideComponent();
    });
  });

  it('should instantiate successfully with default Spring season active', () => {
    expect(component).toBeTruthy();
    expect(component.selectedSeason()).toBe('Spring');
    expect(component.seasons.length).toBe(4);
  });

  it('should toggle item flip card state', () => {
    expect(component.isItemFlippedMethod('item-1')).toBe(false);
    component.toggleItemFlip('item-1');
    expect(component.isItemFlippedMethod('item-1')).toBe(true);
  });

  it('should log foraged botanical item into patient record', () => {
    const item = component.foragingDatabase[0];
    component.logForagedItem(item);
    expect(mockPatientState.addClinicalNote).toHaveBeenCalledWith(expect.objectContaining({
      text: expect.stringContaining(item.name)
    }));
  });
});

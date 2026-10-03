import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { CernLhc3dVisualizerComponent } from './cern-lhc-3d-visualizer.component';

describe('CernLhc3dVisualizerComponent Unit Suite', () => {
  let component: CernLhc3dVisualizerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CernLhc3dVisualizerComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(CernLhc3dVisualizerComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with CERN LHC default parameters', () => {
    expect(component).toBeTruthy();
    expect(component.sqrtS()).toBe(13.6);
    expect(component.bField()).toBe(3.8);
    expect(component.selectedEventType()).toBe('higgs');
    expect(component.eventCount()).toBe(0);
    expect(component.isAutoStream()).toBe(false);
  });

  it('2. Switches collision event types (higgs, top_quark, heavy_ion)', () => {
    component.selectedEventType.set('top_quark');
    expect(component.selectedEventType()).toBe('top_quark');

    component.selectedEventType.set('heavy_ion');
    expect(component.selectedEventType()).toBe('heavy_ion');
  });

  it('3. Modifies magnetic field and center-of-mass energy signals', () => {
    component.bField.set(4.0);
    expect(component.bField()).toBe(4.0);

    component.sqrtS.set(14.0);
    expect(component.sqrtS()).toBe(14.0);
  });

  it('4. Toggles auto-stream signal state', () => {
    expect(component.isAutoStream()).toBe(false);
    component.isAutoStream.set(true);
    expect(component.isAutoStream()).toBe(true);
    component.isAutoStream.set(false);
    expect(component.isAutoStream()).toBe(false);
  });
});

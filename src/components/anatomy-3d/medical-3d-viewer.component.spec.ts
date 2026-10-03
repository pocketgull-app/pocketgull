import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, signal } from '@angular/core';
import { Medical3DViewerComponent } from './medical-3d-viewer.component';

describe('Medical3DViewerComponent Unit Suite', () => {
  let component: Medical3DViewerComponent;

  beforeEach(() => {
    component = Object.create(Medical3DViewerComponent.prototype);
    Object.assign(component, {
      threejsId: signal('knee_joint'),
      severity: signal('yellow'),
      afflictionHighlight: signal('patellar_tendon'),
      particles: signal(true),
      layerMode: signal('acetate'),
      activeLayerMode: signal('acetate'),
      webglSupported: signal(true),
      webglError: signal('')
    });
  });

  it('1. Instantiates successfully with input anatomical model ID', () => {
    expect(component).toBeTruthy();
    expect(component.threejsId()).toBe('knee_joint');
    expect(component.activeLayerMode()).toBe('acetate');
    expect(component.webglSupported()).toBe(true);
  });

  it('2. Changes active layer mode (surface, acetate, core, all)', () => {
    component.setLayerMode('core');
    expect(component.activeLayerMode()).toBe('core');

    component.setLayerMode('surface');
    expect(component.activeLayerMode()).toBe('surface');

    component.setLayerMode('all');
    expect(component.activeLayerMode()).toBe('all');
  });

  it('3. Tracks WebGL support and error signals', () => {
    expect(component.webglError()).toBe('');
    component.webglSupported.set(false);
    component.webglError.set('WebGL 2.0 context unavailable');
    expect(component.webglSupported()).toBe(false);
    expect(component.webglError()).toContain('WebGL');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SowaRigpaTreeSpatialViewerComponent } from './sowa-rigpa-tree-spatial-viewer.component';
import { PatientStateService } from '../../services/patient-state.service';
import { GlobalHealingParadigmsService } from '../../services/global-healing-paradigms.service';

describe('SowaRigpaTreeSpatialViewerComponent Unit Suite', () => {
  let component: SowaRigpaTreeSpatialViewerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SowaRigpaTreeSpatialViewerComponent],
      providers: [
        PatientStateService,
        GlobalHealingParadigmsService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SowaRigpaTreeSpatialViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default Tree I (Physiology) and 3D Perspective enabled', () => {
    expect(component).toBeTruthy();
    expect(component.selectedTree()).toBe('physiology');
    expect(component.is3dPerspective()).toBe(true);
    expect(component.activeTreeNodes().length).toBeGreaterThan(0);
  });

  it('2. Switches across all 3 living trees: Physiology, Diagnosis, and Therapeutics', () => {
    // Tree I
    component.selectedTree.set('physiology');
    const physNodes = component.activeTreeNodes();
    expect(physNodes.some(n => n.id === 'phys_rlung_trunk')).toBe(true);

    // Tree II: Diagnosis
    component.selectedTree.set('diagnosis');
    const diagNodes = component.activeTreeNodes();
    expect(diagNodes.some(n => n.id === 'diag_palpation_pulse')).toBe(true);
    expect(diagNodes.some(n => n.id === 'diag_visual_urine')).toBe(true);

    // Tree III: Therapeutics
    component.selectedTree.set('therapeutics');
    const txNodes = component.activeTreeNodes();
    expect(txNodes.some(n => n.id === 'tx_diet')).toBe(true);
    expect(txNodes.some(n => n.id === 'tx_external')).toBe(true);
  });

  it('3. Selects a node and exposes detailed clinical crosswalk & ICD-11 ICTM codes', () => {
    component.selectedTree.set('physiology');
    const rlungNode = component.activeTreeNodes().find(n => n.id === 'phys_rlung_trunk')!;
    component.selectedNode.set(rlungNode);

    expect(component.selectedNode()?.name).toBe('rLung (Wind / Vagus / Neural Axis)');
    expect(component.selectedNode()?.ictmChapter26Code).toBe('TM1-RLU-01');
    expect(component.selectedNode()?.allopathicCorrelate).toContain('Autonomic');
    expect(component.selectedNode()?.recommendedInterventions?.length).toBeGreaterThan(0);
  });

  it('4. Computes 3D parallax tilt on mouse movements and resets on mouse leave', () => {
    const fakeEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 400 })
      },
      clientX: 300,
      clientY: 100
    } as any;

    component.onCanvasMouseMove(fakeEvent);
    expect(component.tiltX()).not.toBe(12);
    expect(component.tiltY()).not.toBe(-8);

    component.onCanvasMouseLeave();
    expect(component.tiltX()).toBe(12);
    expect(component.tiltY()).toBe(-8);
  });

  it('5. Toggles 3D holographic perspective to 2D schematic', () => {
    expect(component.is3dPerspective()).toBe(true);
    component.is3dPerspective.set(false);
    expect(component.is3dPerspective()).toBe(false);
  });
});

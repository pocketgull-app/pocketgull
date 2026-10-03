import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SowaRigpaTreeSpatialViewerComponent, ISowaRigpaNode } from './sowa-rigpa-tree-spatial-viewer.component';
import { PatientStateService } from '../../services/patient-state.service';
import { GlobalHealingParadigmsService } from '../../services/global-healing-paradigms.service';
import { signal } from '@angular/core';

describe('SowaRigpaTreeSpatialViewerComponent', () => {
  let component: SowaRigpaTreeSpatialViewerComponent;
  let fixture: ComponentFixture<SowaRigpaTreeSpatialViewerComponent>;
  let mockPatientState: any;
  let mockParadigms: any;

  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      canvas: {},
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillStyle: '#000',
      strokeStyle: '#fff',
      lineWidth: 1
    });
  });

  beforeEach(async () => {
    mockPatientState = {
      vitals: signal({
        heartRate: 68,
        hrv: 52
      })
    };

    mockParadigms = {};

    await TestBed.configureTestingModule({
      imports: [SowaRigpaTreeSpatialViewerComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: GlobalHealingParadigmsService, useValue: mockParadigms }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SowaRigpaTreeSpatialViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes with default 3D perspective, physiology tree, and trihumoral pulse mode', () => {
    expect(component).toBeTruthy();
    expect(component.selectedTree()).toBe('physiology');
    expect(component.is3dPerspective()).toBe(true);
    expect(component.tiltX()).toBe(12);
    expect(component.tiltY()).toBe(-8);
    expect(component.activeHumorPulse()).toBe('all');
    expect(component.selectedNode()).toBeNull();
    expect(component.allTreeNodes().length).toBeGreaterThan(0);
  });

  it('2. Filters active tree nodes when switching selected tree (physiology, diagnosis, therapeutics)', () => {
    const physCount = component.activeTreeNodes().length;
    expect(physCount).toBeGreaterThan(0);
    expect(component.activeTreeNodes().every(n => n.treeType === 'physiology')).toBe(true);

    component.selectedTree.set('diagnosis');
    fixture.detectChanges();
    expect(component.activeTreeNodes().every(n => n.treeType === 'diagnosis')).toBe(true);

    component.selectedTree.set('therapeutics');
    fixture.detectChanges();
    expect(component.activeTreeNodes().every(n => n.treeType === 'therapeutics')).toBe(true);
  });

  it('3. Selects a node and exposes detailed Tibetan nomenclature and ICD-11 ICTM crosswalk', () => {
    const rootNode = component.allTreeNodes().find(n => n.id === 'phys_root_health');
    expect(rootNode).toBeDefined();

    component.selectedNode.set(rootNode!);
    fixture.detectChanges();

    expect(component.selectedNode()?.name).toBe('Root of Healthy Physiology');
    expect(component.selectedNode()?.tibetanName).toBe('Lus kyi rTsa-ba');
    expect(component.selectedNode()?.ictmChapter26Code).toBe('TM1-PHY-01');
    expect(component.getNodeClasses(rootNode!)).toContain('ring-2 ring-teal-400');
  });

  it('4. Modulates 3D perspective tilts on canvas mouse movement and resets on mouse leave', () => {
    const fakeContainer = {
      getBoundingClientRect: () => ({ left: 100, top: 100, width: 400, height: 400 })
    } as unknown as HTMLElement;

    const fakeMoveEvent = {
      clientX: 350,
      clientY: 320,
      currentTarget: fakeContainer
    } as unknown as MouseEvent;

    component.onCanvasMouseMove(fakeMoveEvent);
    expect(component.tiltX()).not.toBe(12);
    expect(component.tiltY()).not.toBe(-8);

    component.onCanvasMouseLeave();
    expect(component.tiltX()).toBe(12);
    expect(component.tiltY()).toBe(-8);

    // When 3D perspective is disabled, mouse move should not change tilt
    component.is3dPerspective.set(false);
    component.onCanvasMouseMove(fakeMoveEvent);
    expect(component.tiltX()).toBe(12);
    expect(component.tiltY()).toBe(-8);
  });

  it('5. Switches humoral pulse modes (all, rlung, mkhrispa, badkan) and updates Gyushi tactile descriptors', () => {
    component.activeHumorPulse.set('rlung');
    fixture.detectChanges();
    expect(component.currentPulseDescriptor()).toContain('Wind agitation');

    component.activeHumorPulse.set('mkhrispa');
    fixture.detectChanges();
    expect(component.currentPulseDescriptor()).toContain('bowstring');

    component.activeHumorPulse.set('badkan');
    fixture.detectChanges();
    expect(component.currentPulseDescriptor()).toContain('phlegmatic viscosity');

    component.activeHumorPulse.set('all');
    fixture.detectChanges();
    expect(component.currentPulseDescriptor()).toContain('trihumoral radial confluence');
  });

  it('6. Computes live heart rate and HRV telemetry from patientState vitals or defaults', () => {
    expect(component.heartRate()).toBe(68);
    expect(component.hrv()).toBe(52);

    mockPatientState.vitals.set(null);
    fixture.detectChanges();
    expect(component.heartRate()).toBe(72);
    expect(component.hrv()).toBe(45);
  });

  it('7. Formats humor badges and node emojis accurately across Nyepa Sum categories', () => {
    const rlungNode: ISowaRigpaNode = {
      id: 'test_rlung',
      name: 'rLung Node',
      tibetanName: 'rlung',
      humor: 'rlung',
      category: 'trunk',
      treeType: 'physiology',
      x: 10,
      y: 10,
      depthZ: 0,
      allopathicCorrelate: 'Nervous System',
      ictmChapter26Code: 'TM1-01',
      clinicalDescription: 'Test rlung'
    };

    const mkhrispaNode: ISowaRigpaNode = {
      ...rlungNode,
      id: 'test_mkhrispa',
      humor: 'mkhrispa'
    };

    const badkanNode: ISowaRigpaNode = {
      ...rlungNode,
      id: 'test_badkan',
      humor: 'badkan'
    };

    const rootNode: ISowaRigpaNode = {
      ...rlungNode,
      id: 'test_root',
      category: 'root',
      humor: 'trihumoral'
    };

    expect(component.getNodeEmoji(rootNode)).toBe('🌱');
    expect(component.getNodeEmoji(rlungNode)).toBe('💨');
    expect(component.getNodeEmoji(mkhrispaNode)).toBe('🔥');
    expect(component.getNodeEmoji(badkanNode)).toBe('💧');

    expect(component.getHumorBadgeClass('rlung')).toContain('text-sky-300');
    expect(component.getHumorBadgeClass('mkhrispa')).toContain('text-amber-300');
    expect(component.getHumorBadgeClass('badkan')).toContain('text-slate-200');
    expect(component.getHumorBadgeClass('other')).toContain('text-teal-300');
  });

  it('8. Safely executes drawPulseFrame and terminates animation loop on ngOnDestroy', () => {
    expect(() => component.drawPulseFrame()).not.toThrow();
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});

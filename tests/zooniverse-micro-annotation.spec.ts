import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ZooniverseMicroAnnotationComponent } from '../src/components/zooniverse-micro-annotation.component';

describe('ZooniverseMicroAnnotationComponent', () => {
  let component: ZooniverseMicroAnnotationComponent;
  let fixture: ComponentFixture<ZooniverseMicroAnnotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZooniverseMicroAnnotationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ZooniverseMicroAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with default Etch A Cell project and 3D organelle targets', () => {
    expect(component).toBeTruthy();
    expect(component.selectedProjectId()).toBe('etch-a-cell-mito');
    expect(component.activeProject().name).toContain('Etch A Cell');
    expect(component.activeProject().organelles.length).toBeGreaterThan(2);
  });

  it('should toggle 3D jargon-buster card flip state machine', () => {
    expect(component.isJargonFlipped()).toBe(false);
    component.toggleJargonFlip();
    expect(component.isJargonFlipped()).toBe(true);
    component.toggleJargonFlip();
    expect(component.isJargonFlipped()).toBe(false);
  });

  it('should toggle 3D wireframe and rotation state', () => {
    expect(component.isMeshWireframe()).toBe(false);
    component.toggleWireframe();
    expect(component.isMeshWireframe()).toBe(true);

    expect(component.isAutoRotating()).toBe(true);
    component.toggleRotation();
    expect(component.isAutoRotating()).toBe(false);
  });

  it('should switch projects and update organelle metadata', () => {
    const event = { target: { value: 'science-scribbler-huntington' } } as unknown as Event;
    component.onProjectSelect(event);
    expect(component.selectedProjectId()).toBe('science-scribbler-huntington');
    expect(component.activeProject().category).toBe('Neurodegeneration');
  });

  it('should run Dr. Vesalius weak-supervision simulation and increase completion percent', async () => {
    const initialCompletion = component.completionPercent();
    expect(initialCompletion).toBe(22);

    component.runDrVesaliusWeakSupervision();
    expect(component.isAiProcessing()).toBe(true);

    // Wait for simulation timeout
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(component.isAiProcessing()).toBe(false);
    expect(component.completionPercent()).toBe(94);
    expect(component.agentConsoleMessage()).toContain('Dr. Vesalius pre-segmentation complete');
  });

  it('should trigger FHIR R4 DiagnosticReport Bundle export without throwing', () => {
    const spy = vi.spyOn(component as any, 'downloadJsonFile').mockImplementation(() => {});
    component.exportFhirR4Bundle();
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('fhir-r4-diagnostic-report'),
      expect.objectContaining({
        resourceType: 'Bundle',
        type: 'transaction'
      })
    );
    spy.mockRestore();
  });

  it('should trigger Zooniverse Panoptes JSON export without throwing', () => {
    const spy = vi.spyOn(component as any, 'downloadJsonFile').mockImplementation(() => {});
    component.exportZooniverseJson();
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('zooniverse-panoptes'),
      expect.objectContaining({
        project_id: component.selectedProjectId(),
        total_slices: component.activeProject().totalSlices
      })
    );
    spy.mockRestore();
  });
});

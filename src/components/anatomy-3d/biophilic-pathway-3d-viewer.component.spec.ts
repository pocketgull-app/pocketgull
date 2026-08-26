import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BiophilicPathway3dViewerComponent } from './biophilic-pathway-3d-viewer.component';
import { AdaptiveGreenRoutingService } from '../../services/adaptive-green-routing.service';
import { MovementHealingQuestService } from '../../services/movement-healing-quest.service';

describe('BiophilicPathway3dViewerComponent', () => {
  let component: BiophilicPathway3dViewerComponent;
  let fixture: ComponentFixture<BiophilicPathway3dViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiophilicPathway3dViewerComponent],
      providers: [AdaptiveGreenRoutingService, MovementHealingQuestService]
    }).compileComponents();

    fixture = TestBed.createComponent(BiophilicPathway3dViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes 3D Biophilic Pathway Viewer with default acoustic heatmap false', () => {
    expect(component).toBeTruthy();
    expect(component.isAcousticHeatmapActive()).toBe(false);
  });

  it('2. Toggles acoustic noise heatmap layer on and off', () => {
    component.toggleAcousticHeatmap();
    expect(component.isAcousticHeatmapActive()).toBe(true);

    component.toggleAcousticHeatmap();
    expect(component.isAcousticHeatmapActive()).toBe(false);
  });

  it('3. Resets camera viewpoint cleanly', () => {
    expect(() => component.resetCameraView()).not.toThrow();
  });
});

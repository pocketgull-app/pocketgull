import '@angular/compiler';
import { ArtTherapyCanvasComponent } from './art-therapy-canvas.component';
import { runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { ArtTherapyService } from '../services/art-therapy.service';
import { BioHapticFeedbackService } from '../services/bio-haptic-feedback.service';

describe('ArtTherapyCanvasComponent', () => {
  let component: ArtTherapyCanvasComponent;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = createEnvironmentInjector([
      { provide: ArtTherapyService, useFactory: () => new ArtTherapyService() },
      { provide: BioHapticFeedbackService, useValue: { playSolfeggioTone: vi.fn(), triggerHapticPulse: vi.fn() } }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new ArtTherapyCanvasComponent();
    });
  });

  it('should initialize with Kintsugi Golden Seam Repair prompt', () => {
    expect(component).toBeTruthy();
    expect(component.selectedPrompt()?.title).toContain('Kintsugi');
  });

  it('should pick color and compute active Solfeggio frequency', () => {
    component.pickColor('#10B981');
    expect(component.selectedColor()).toBe('#10B981');
    expect(component.activeFrequency()).toBe(528);
  });

  it('should execute paintStroke without throwing error', () => {
    expect(() => component.paintStroke()).not.toThrow();
  });
});

import '@angular/compiler';
import { YogaAsana3dCoachComponent } from './yoga-asana-3d-coach.component';
import { runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { YogaAsanaCoachingService } from '../../services/yoga-asana-coaching.service';
import { DictationService } from '../../services/dictation.service';
import { BioHapticFeedbackService } from '../../services/hardware/bio-haptic-feedback.service';

describe('YogaAsana3dCoachComponent', () => {
  let component: YogaAsana3dCoachComponent;
  let injector: EnvironmentInjector;
  let mockDictation: any;

  beforeEach(() => {
    mockDictation = {
      speakResponse: vi.fn()
    };

    injector = createEnvironmentInjector([
      { provide: YogaAsanaCoachingService, useValue: { curatedAsanaLibrary: [
        { name: 'Cobra Pose', sanskritName: 'Bhujangasana', instructions: ['Lie on stomach', 'Lift chest'] },
        { name: 'Pigeon Pose', sanskritName: 'Kapotasana', instructions: ['Bring knee forward'] }
      ] } },
      { provide: BioHapticFeedbackService, useValue: { triggerHapticPulse: vi.fn() } },
      { provide: DictationService, useValue: mockDictation }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new YogaAsana3dCoachComponent();
    });
  });

  it('should initialize with default selected Cobra Pose', () => {
    expect(component).toBeTruthy();
    expect(component.selectedPose()?.name).toBe('Cobra Pose');
  });

  it('should select new pose when selectPose is called', () => {
    const pigeon = component.poses.find(p => p.name === 'Pigeon Pose')!;
    component.selectPose(pigeon);
    expect(component.selectedPose()?.name).toBe('Pigeon Pose');
  });

  it('should narrate pose instructions aloud via TTS', () => {
    component.narrateInstructions(component.poses[0]);
    expect(mockDictation.speakResponse).toHaveBeenCalledWith(expect.stringContaining('Cobra Pose'));
  });
});

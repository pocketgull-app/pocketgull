import { TestBed } from '@angular/core/testing';
import { KitchenVoiceAlchemistService } from './kitchen-voice-alchemist.service';
import { PatientStateService } from './patient-state.service';
import { LocalFoodshedOnlineMenuService } from './local-foodshed-online-menu.service';

describe('KitchenVoiceAlchemistService', () => {
  let service: KitchenVoiceAlchemistService;
  let foodshed: LocalFoodshedOnlineMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        KitchenVoiceAlchemistService,
        PatientStateService,
        LocalFoodshedOnlineMenuService
      ]
    });

    service = TestBed.inject(KitchenVoiceAlchemistService);
    foodshed = TestBed.inject(LocalFoodshedOnlineMenuService);
  });

  it('should initialize with default pantry recipe and timers', () => {
    expect(service.formulatedRecipe()).toBeTruthy();
    expect(service.formulatedRecipe().biochemicalSynergies.length).toBeGreaterThan(0);
    expect(service.activeTimers().length).toBeGreaterThanOrEqual(2);
  });

  it('should generate an Ayurvedic recipe when lentils or rice are input', () => {
    service.generateAlchemistRecipe('Red Lentils, Basmati Rice, Cumin, Ghee');
    expect(service.formulatedRecipe().culinaryTradition).toBe('Ayurveda (Āhāra)');
    expect(service.formulatedRecipe().title).toContain('Kitchari');
  });

  it('should answer kitchen culinary questions with evidence-grounded responses', () => {
    const ans1 = service.answerKitchenQuestion('How do I prepare scallion roots for Cong Bai Tang?');
    expect(ans1).toContain('Cong Bai Tang');
    expect(ans1).toContain('roots intact');

    const ans2 = service.answerKitchenQuestion('Why pair black pepper with turmeric?');
    expect(ans2).toContain('piperine');
    expect(ans2).toContain('2000 percent');
  });

  it('should trigger 3D simulation through foodshed service', () => {
    const spy = vi.spyOn(foodshed, 'simulateIn3dAnatomy');
    service.simulateIn3d();
    expect(spy).toHaveBeenCalled();
  });
});

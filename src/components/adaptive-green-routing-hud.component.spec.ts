import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdaptiveGreenRoutingHudComponent } from './adaptive-green-routing-hud.component';
import { AdaptiveGreenRoutingService } from '../services/adaptive-green-routing.service';

describe('AdaptiveGreenRoutingHudComponent', () => {
  let component: AdaptiveGreenRoutingHudComponent;
  let fixture: ComponentFixture<AdaptiveGreenRoutingHudComponent>;
  let routingService: AdaptiveGreenRoutingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdaptiveGreenRoutingHudComponent],
      providers: [AdaptiveGreenRoutingService]
    }).compileComponents();

    fixture = TestBed.createComponent(AdaptiveGreenRoutingHudComponent);
    component = fixture.componentInstance;
    routingService = TestBed.inject(AdaptiveGreenRoutingService);
    fixture.detectChanges();
  });

  it('1. Initializes HUD with default Sensory Shield mode and ADA compliance', () => {
    expect(component).toBeTruthy();
    expect(component.activeSensoryMode()).toBe('SENSORY_SHIELD');
    expect(component.userProfile().physical.wheelchairAccessible).toBe(true);
  });

  it('2. Switches cognitive mode to Landmark Anchored and updates service', () => {
    component.selectCognitiveMode('LANDMARK_ANCHORED');
    expect(routingService.userAccessProfile().cognitive.sensoryMode).toBe('LANDMARK_ANCHORED');
  });

  it('3. Computes optimized route and activates turn-by-turn navigation', () => {
    component.computeRoute();
    fixture.detectChanges();

    expect(routingService.isNavigating()).toBe(true);
    expect(routingService.activeRoutePlan()).not.toBeNull();
    expect(component.currentStep()).not.toBeNull();
  });

  it('4. Triggers Emergency Sanctuary guidance and activates crisis breathing mode', () => {
    component.triggerEmergencySanctuary();
    fixture.detectChanges();

    expect(routingService.isSanctuaryActive()).toBe(true);
    expect(routingService.isNavigating()).toBe(true);
    expect(routingService.activeRoutePlan()?.sanctuaryInfo).toBeDefined();
  });

  it('5. Cancels navigation and resets active route', () => {
    component.computeRoute();
    expect(routingService.isNavigating()).toBe(true);

    component.cancelNavigation();
    expect(routingService.isNavigating()).toBe(false);
    expect(routingService.activeRoutePlan()).toBeNull();
  });
});

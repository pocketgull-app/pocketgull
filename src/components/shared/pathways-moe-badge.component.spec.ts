import '@angular/compiler';
import { PathwaysMoeBadgeComponent } from './pathways-moe-badge.component';
import { ClinicalMoERouterService } from '../../services/clinical-moe-router.service';

describe('PathwaysMoeBadgeComponent', () => {
  let component: PathwaysMoeBadgeComponent;
  let moeRouter: ClinicalMoERouterService;

  beforeEach(() => {
    moeRouter = new ClinicalMoERouterService();
    component = new PathwaysMoeBadgeComponent();
    (component as any).moeRouter = moeRouter;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.isExpanded()).toBe(false);
  });

  it('should calculate active FLOPs correctly', () => {
    expect(component.activeFlops()).toBe(1.2);
    expect(component.savingsPercent()).toBe(36);
  });

  it('should toggle expanded state when toggleExpanded is called', () => {
    component.toggleExpanded();
    expect(component.isExpanded()).toBe(true);

    component.toggleExpanded();
    expect(component.isExpanded()).toBe(false);
  });

  it('should update active experts when router state changes', () => {
    moeRouter.setAcousticTelemetryState(true);
    expect(component.activeExperts().length).toBe(2);
    expect(component.activeFlops()).toBe(1.35);
  });
});

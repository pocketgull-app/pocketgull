import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HyperscalerMarketplacePortalComponent } from './hyperscaler-marketplace-portal.component';
import { HyperscalerDeploymentService } from '../services/hyperscaler-deployment.service';

describe('HyperscalerMarketplacePortalComponent', () => {
  let component: HyperscalerMarketplacePortalComponent;
  let fixture: ComponentFixture<HyperscalerMarketplacePortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HyperscalerMarketplacePortalComponent],
      providers: [HyperscalerDeploymentService]
    }).compileComponents();

    fixture = TestBed.createComponent(HyperscalerMarketplacePortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render GCP by default and offer provider switching', () => {
    expect(component.hyperscaler.activeProvider()).toContain('Google Cloud Platform');
    component.hyperscaler.setActiveProvider('Amazon Web Services (AWS)');
    fixture.detectChanges();
    expect(component.hyperscaler.activeProvider()).toContain('AWS');
  });
});

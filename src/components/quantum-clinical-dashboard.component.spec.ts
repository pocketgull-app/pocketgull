import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuantumClinicalDashboardComponent } from './quantum-clinical-dashboard.component';
import { QuantumClinicalEngineService } from '../services/quantum-clinical-engine.service';

describe('QuantumClinicalDashboardComponent', () => {
  let component: QuantumClinicalDashboardComponent;
  let fixture: ComponentFixture<QuantumClinicalDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuantumClinicalDashboardComponent],
      providers: [QuantumClinicalEngineService]
    }).compileComponents();

    fixture = TestBed.createComponent(QuantumClinicalDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger VQE quantum docking simulation', async () => {
    await component.runDockingSimulation();
    expect(component.dockingResult()).not.toBeNull();
    expect(component.dockingResult()?.bindingAffinityKcalMol).toBeLessThan(0);
  });
});

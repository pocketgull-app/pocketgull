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
    await component.runVqeDocking();
    expect(component.dockingResult()).not.toBeNull();
    expect(component.dockingResult()?.bindingAffinityKcalMol).toBeLessThan(0);
  });

  it('should trigger QAOA cohort triage optimization', async () => {
    await component.runQaoaTriage();
    expect(component.qaoaResult()).not.toBeNull();
    expect(component.qaoaResult()?.maxCostReductionPercent).toBeGreaterThan(30);
  });

  it('should trigger NV-center quantum magnetometry acquisition', async () => {
    component.activeTab.set('sensing');
    fixture.detectChanges();
    await component.runNvSensing();
    expect(component.nvResult()).not.toBeNull();
    expect(component.nvResult()?.magneticFluxFemtotesla).toBeGreaterThan(0);
  });

  it('should trigger DUNE particle transport kinetic simulation', async () => {
    component.activeTab.set('dune');
    fixture.detectChanges();
    await component.runDuneTransport();
    expect(component.duneResult()).not.toBeNull();
    expect(component.duneResult()?.mitochondrialAtpYieldMmol).toBeGreaterThan(20);
  });

  it('should trigger NIST PQC key generation & FHIR encryption', async () => {
    component.activeTab.set('pqc');
    fixture.detectChanges();
    await component.runPqcEncryption();
    expect(component.pqcResult()).not.toBeNull();
    expect(component.pqcResult()?.verified).toBe(true);
  });
});

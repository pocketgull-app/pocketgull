import { TestBed } from '@angular/core/testing';
import { ThermalHospitalLabelComponent } from './thermal-hospital-label.component';
import { ClinicalProvenanceService } from '../../services/clinical-provenance.service';

describe('ThermalHospitalLabelComponent', () => {
  let component: ThermalHospitalLabelComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThermalHospitalLabelComponent],
      providers: [ClinicalProvenanceService]
    }).compileComponents();

    const fixture = TestBed.createComponent(ThermalHospitalLabelComponent);
    component = fixture.componentInstance;
  });

  it('1. should create the thermal label component with vector preview active', () => {
    expect(component).toBeTruthy();
    expect(component.isThermalSimulationActive()).toBe(false);
  });

  it('2. should toggle 203 DPI thermal ink bleed simulation', () => {
    component.toggleThermalDpiSimulation();
    expect(component.isThermalSimulationActive()).toBe(true);

    component.toggleThermalDpiSimulation();
    expect(component.isThermalSimulationActive()).toBe(false);
  });

  it('3. should generate Zebra ZPL II print string for bedside hardware interop', () => {
    const zpl = component.zplOutput();
    expect(zpl).toContain('^XA');
    expect(zpl).toContain('POCKETGULL HEALTH');
    expect(zpl).toContain('CEFAZOLIN 2 g IV');
    expect(zpl).toContain('^XZ');
  });

  it('4. should generate real-time Part 11 cryptographic seal upon action', async () => {
    expect(component.currentReceipt()).toBeNull();
    await component.generateSeal();
    const receipt = component.currentReceipt();
    expect(receipt).not.toBeNull();
    expect(receipt?.receiptId).toContain('RX-SEAL-');
    expect(receipt?.ismpCompliance.passed).toBe(true);
  });
});

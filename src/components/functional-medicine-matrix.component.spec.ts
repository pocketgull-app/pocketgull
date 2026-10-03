import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FunctionalMedicineMatrixComponent } from './functional-medicine-matrix.component';
import { PatientStateService } from '../services/patient-state.service';
import { signal } from '@angular/core';

describe('FunctionalMedicineMatrixComponent', () => {
  let component: FunctionalMedicineMatrixComponent;
  let fixture: ComponentFixture<FunctionalMedicineMatrixComponent>;
  let mockPatientState: any;

  beforeEach(async () => {
    mockPatientState = {
      systemicInflammatoryBurden: signal({
        score: 24,
        hsCrpEstimate: '0.8 mg/L',
        status: 'Low / Controlled'
      }),
      mitochondrialEfficiencyScore: signal({
        efficiencyPct: 82,
        nadNadhRatio: '3.49',
        atpTurnoverIndex: 'Optimal OxPhos Output'
      }),
      gutBrainAxisScore: signal({
        permeabilityIndex: 75,
        zonulinStatus: 'Intact Intestinal Barrier',
        butyrateSynthesis: 'Robust SCFA Bio-availability',
        lpsEndotoxemiaRisk: 'Low Translocation Risk'
      })
    };

    await TestBed.configureTestingModule({
      imports: [FunctionalMedicineMatrixComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FunctionalMedicineMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default IFM telemetry scores and selected node Assimilation', () => {
    expect(component).toBeTruthy();
    expect(component.selectedIfmNode()).toBe('Assimilation');
    expect(component.inflammatory().score).toBe(24);
    expect(component.mitochondrial().efficiencyPct).toBe(82);
    expect(component.gutBrain().permeabilityIndex).toBe(75);
    expect(component.ifmNodes.length).toBe(7);

    const activeData = component.getActiveNodeData();
    expect(activeData.name).toBe('Assimilation');
    expect(activeData.icon).toBe('🍲');
  });

  it('2. Toggles 3D card flip on toggleCardFlip with debounce protection', () => {
    expect(component.isCardFlipped('inflam')).toBe(false);

    component.toggleCardFlip('inflam');
    expect(component.isCardFlipped('inflam')).toBe(true);

    // Immediate second call within 200ms is debounced
    component.toggleCardFlip('inflam');
    expect(component.isCardFlipped('inflam')).toBe(true);

    // After debounce interval, toggles back
    vi.setSystemTime(Date.now() + 300);
    component.toggleCardFlip('inflam');
    expect(component.isCardFlipped('inflam')).toBe(false);
  });

  it('3. Switches active IFM node and updates activeNodeData description and icon', () => {
    component.selectedIfmNode.set('Energy Production');
    fixture.detectChanges();

    const activeData = component.getActiveNodeData();
    expect(activeData.name).toBe('Energy Production');
    expect(activeData.icon).toBe('⚡');
    expect(activeData.description).toContain('Mitochondrial OxPhos');

    component.selectedIfmNode.set('Biotransformation');
    fixture.detectChanges();
    const detoxData = component.getActiveNodeData();
    expect(detoxData.name).toBe('Biotransformation');
    expect(detoxData.icon).toBe('🧪');
  });

  it('4. Returns fallback node data if selected node is not found', () => {
    component.selectedIfmNode.set('NonExistentNode');
    fixture.detectChanges();

    const fallback = component.getActiveNodeData();
    expect(fallback.name).toBe('Assimilation');
    expect(fallback.id).toBe('assimilation');
  });

  it('5. Reflects updated patient state telemetry scores', () => {
    mockPatientState.systemicInflammatoryBurden.set({
      score: 68,
      hsCrpEstimate: '3.4 mg/L',
      status: 'Active Inflammatory Cascade'
    });
    fixture.detectChanges();

    expect(component.inflammatory().score).toBe(68);
    expect(component.inflammatory().status).toBe('Active Inflammatory Cascade');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('68');
  });
});

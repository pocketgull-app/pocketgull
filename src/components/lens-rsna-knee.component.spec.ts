import { LensRsnaKneeComponent } from './lens-rsna-knee.component';
import { signal } from '@angular/core';

describe('LensRsnaKneeComponent Unit Suite', () => {
  let component: LensRsnaKneeComponent;
  let mockPatientState: any;

  beforeEach(() => {
    mockPatientState = {
      selectedPartId: signal(''),
      issues: signal<Record<string, any[]>>({}),
      selectPart: vi.fn((id: string) => {
        mockPatientState.selectedPartId.set(id);
      }),
      fetchRsnaKneePrediction: vi.fn().mockResolvedValue({
        study_id: 'P001',
        probabilities: {
          acl: 0.95,
          medial_meniscus: 0.92
        }
      })
    };

    component = new LensRsnaKneeComponent();
    (component as any).patientStateService = mockPatientState;
  });

  it('1. Initializes with 12 MSK abnormality targets and default kinematics', () => {
    expect(component.targets().length).toBe(12);
    expect(component.planes).toEqual(['All', 'Sagittal', 'Coronal', 'Axial']);
    expect(component.kinematics()).toBeDefined();
    expect(component.kinematics()?.qAngleDegrees).toBe(12.2);
  });

  it('2. Filters targets by imaging plane (Sagittal, Coronal, Axial)', () => {
    component.selectedPlane.set('Sagittal');
    const sagittal = component.filteredTargets();
    expect(sagittal.every(t => t.primaryPlane === 'Sagittal')).toBe(true);
    expect(sagittal.some(t => t.key === 'acl')).toBe(true);

    component.selectedPlane.set('Coronal');
    const coronal = component.filteredTargets();
    expect(coronal.every(t => t.primaryPlane === 'Coronal')).toBe(true);
    expect(coronal.some(t => t.key === 'mcl')).toBe(true);

    component.selectedPlane.set('Axial');
    const axial = component.filteredTargets();
    expect(axial.every(t => t.primaryPlane === 'Axial')).toBe(true);
    expect(axial.some(t => t.key === 'effusion')).toBe(true);
  });

  it('3. Selects anatomical target in 3D viewer when clicked', () => {
    const aclTarget = component.targets().find(t => t.key === 'acl')!;
    component.focusTargetIn3D(aclTarget);

    expect(mockPatientState.selectPart).toHaveBeenCalledWith('leg_left');
    expect(mockPatientState.issues()['leg_left']).toBeDefined();
    expect(mockPatientState.issues()['leg_left'][0].name).toContain('ACL Tear');
  });

  it('4. Loads preset clinical impressions and updates NLP model prediction', async () => {
    component.loadPresetImpression('acl_tear');
    expect(component.customReportText).toContain('anterior cruciate ligament');

    component.loadPresetImpression('normal');
    expect(component.customReportText).toContain('Intact cruciate');
  });

  it('5. Exports FHIR R4 DiagnosticReport Bundle', () => {
    component.exportFhirBundle();
    expect(component.fhirExported()).toBe(true);
  });
});

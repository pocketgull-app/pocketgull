import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PatientUnderTreeComponent, IDistantFamilyTree } from './patient-under-tree.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { ExportService } from '../services/export.service';

describe('PatientUnderTreeComponent Unit Suite', () => {
  let component: PatientUnderTreeComponent;
  let mockExportService: { exportPatientToFhirJson: ReturnType<typeof vi.fn> };
  let mockPatientManager: {
    selectedPatientId: ReturnType<typeof signal<string | null>>;
    patients: ReturnType<typeof signal<any[]>>;
  };

  beforeEach(async () => {
    mockExportService = {
      exportPatientToFhirJson: vi.fn()
    };

    mockPatientManager = {
      selectedPatientId: signal<string | null>('pt-101'),
      patients: signal<any[]>([
        { id: 'pt-101', name: 'Charles Darwin', age: 73 }
      ])
    };

    const mockPatientState = {
      patientName: signal('Charles Darwin'),
      patientAge: signal(73),
      vitals: signal({ bp: '120/80', hr: '72' })
    };

    await TestBed.configureTestingModule({
      imports: [PatientUnderTreeComponent],
      providers: [
        { provide: ExportService, useValue: mockExportService },
        { provide: PatientManagementService, useValue: mockPatientManager },
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PatientUnderTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('1. Instantiates successfully and computes active patient name', () => {
    expect(component).toBeTruthy();
    expect(component.activePatientName()).toBe('Charles Darwin');
    expect(component.isBreathingActive()).toBe(false);
  });

  it('2. Computes default paradigm info and transitions across therapeutic paradigms', () => {
    expect(component.activeParadigm()).toBe('western');
    expect(component.activeParadigmInfo().treeName).toContain('Red Oak');

    component.selectParadigm('functional');
    expect(component.activeParadigm()).toBe('functional');
    expect(component.activeParadigmInfo().treeName).toContain('Orchard of Resiliency');

    component.selectParadigm('tcm');
    expect(component.activeParadigm()).toBe('tcm');
    expect(component.activeParadigmInfo().treeName).toContain('Five Elements');

    component.selectParadigm('ayurvedic');
    expect(component.activeParadigm()).toBe('ayurvedic');
    expect(component.activeParadigmInfo().treeName).toContain('Sacred Fig');
  });

  it('3. Toggles vagal resonant breathing guide signal', () => {
    expect(component.isBreathingActive()).toBe(false);
    component.toggleBreathingGuide();
    expect(component.isBreathingActive()).toBe(true);
    component.toggleBreathingGuide();
    expect(component.isBreathingActive()).toBe(false);
  });

  it('4. Exports patient record to FHIR R4 via ExportService', () => {
    component.exportFhir();
    expect(mockExportService.exportPatientToFhirJson).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'pt-101', name: 'Charles Darwin' })
    );
  });

  it('5. Manages family tree horizon selection and handles canvas click interaction', () => {
    expect(component.selectedFamilyTree()).toBeNull();
    const motherTree = component.familyTrees.find(t => t.relation === 'Mother');
    expect(motherTree).toBeDefined();

    if (motherTree) {
      component.selectedFamilyTree.set(motherTree);
      expect(component.selectedFamilyTree()?.relation).toBe('Mother');
      expect(component.selectedFamilyTree()?.healthSyncPercent).toBe(88);
    }
  });

  it('6. Falls back to default patient name when no selected patient exists', () => {
    mockPatientManager.selectedPatientId.set(null);
    expect(component.activePatientName()).toBe('Charles Darwin');
  });
});

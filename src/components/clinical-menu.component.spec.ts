import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, signal } from '@angular/core';
import { ClinicalMenuComponent } from './clinical-menu.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

describe('ClinicalMenuComponent Unit Suite', () => {
  let component: ClinicalMenuComponent;
  let mockPatientState: {
    patientAge: ReturnType<typeof signal<number>>;
    vitals: ReturnType<typeof signal<{ bp?: string; hr?: string }>>;
    addClinicalNote: ReturnType<typeof vi.fn>;
    addDraftSummaryItem: ReturnType<typeof vi.fn>;
  };
  let mockPatientManager: {
    selectedPatientId: ReturnType<typeof signal<string | null>>;
    patients: ReturnType<typeof signal<any[]>>;
  };

  beforeEach(async () => {
    mockPatientState = {
      patientAge: signal(52),
      vitals: signal({ bp: '138/88', hr: '90' }),
      addClinicalNote: vi.fn(),
      addDraftSummaryItem: vi.fn()
    };

    mockPatientManager = {
      selectedPatientId: signal<string | null>('pt-braun'),
      patients: signal<any[]>([
        {
          id: 'pt-braun',
          name: 'Dieter Rams',
          preexistingConditions: ['Hypertension', 'Inflammation', 'Cardiovascular']
        }
      ])
    };

    await TestBed.configureTestingModule({
      imports: [ClinicalMenuComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PatientManagementService, useValue: mockPatientManager }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ClinicalMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Instantiates successfully with default menu items and patient name', () => {
    expect(component).toBeTruthy();
    expect(component.activePatientName()).toBe('Dieter Rams');
    expect(component.menuItems.length).toBeGreaterThanOrEqual(4);
    expect(component.selectedCategory()).toBe('All Courses');
    expect(component.filteredMenuItems().length).toBe(component.menuItems.length);
  });

  it('2. Filters menu items across culinary course categories', () => {
    component.selectedCategory.set('Starters');
    expect(component.filteredMenuItems().every(i => i.category === 'Starter')).toBe(true);

    component.selectedCategory.set('Mains');
    expect(component.filteredMenuItems().every(i => i.category === 'Main Course')).toBe(true);

    component.selectedCategory.set('Elixirs');
    expect(component.filteredMenuItems().every(i => i.category === 'Therapeutic Elixir')).toBe(true);

    component.selectedCategory.set('Tonics');
    expect(component.filteredMenuItems().every(i => i.category === 'Restorative Tonic')).toBe(true);

    component.selectedCategory.set('All Courses');
    expect(component.filteredMenuItems().length).toBe(component.menuItems.length);
  });

  it('3. Evaluates patient precision telemetry match score and rationale', () => {
    const salmonDish = component.menuItems.find(i => i.name.includes('Salmon'));
    expect(salmonDish).toBeDefined();

    if (salmonDish) {
      const match = component.evaluatePatientMatch(salmonDish);
      expect(match.score).toBeGreaterThanOrEqual(75);
      expect(match.reason).toBeDefined();
      expect(match.reason.length).toBeGreaterThan(0);
    }
  });

  it('4. Prescribes meal and records clinical note into patient state', () => {
    const item = component.menuItems[0];
    component.prescribeMeal(item);

    expect(mockPatientState.addClinicalNote).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceLens: 'Nutrition',
        text: expect.stringContaining(item.name)
      })
    );
    expect(mockPatientState.addDraftSummaryItem).toHaveBeenCalledWith(
      `meal-${item.id}`,
      expect.stringContaining(item.name)
    );
  });

  it('5. Handles 3D item selection and tracks selected dish', () => {
    expect(component.selectedMenuItem()).toBeNull();
    const item = component.menuItems[1];
    component.on3dItemSelect(item);
    expect(component.selectedMenuItem()).toEqual(item);
  });

  it('6. Toggles mobile menu QR modal visibility state', () => {
    expect(component.isQrModalOpen()).toBe(false);
    component.isQrModalOpen.set(true);
    expect(component.isQrModalOpen()).toBe(true);
    component.isQrModalOpen.set(false);
    expect(component.isQrModalOpen()).toBe(false);
  });

  it('7. Contains complete Dieter Rams Unicode emoji badge definitions', () => {
    expect(component.emojiBadges.length).toBe(10);
    expect(component.emojiBadges.some(b => b.label === 'Avocado')).toBe(true);
    expect(component.emojiBadges.some(b => b.label === 'Wild Salmon')).toBe(true);
  });
});

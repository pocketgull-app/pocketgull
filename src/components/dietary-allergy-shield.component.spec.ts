import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DietaryAllergyShieldComponent } from './dietary-allergy-shield.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

describe('DietaryAllergyShieldComponent', () => {
  let component: DietaryAllergyShieldComponent;
  let fixture: ComponentFixture<DietaryAllergyShieldComponent>;
  let addClinicalNoteSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    addClinicalNoteSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [DietaryAllergyShieldComponent],
      providers: [
        {
          provide: PatientStateService,
          useValue: {
            addClinicalNote: addClinicalNoteSpy
          }
        },
        {
          provide: PatientManagementService,
          useValue: {
            selectedPatientId: signal('p-allergy-001'),
            patients: signal([
              { id: 'p-allergy-001', name: 'Phil Gear (Metabolic & Allergic Profile)' }
            ])
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DietaryAllergyShieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and compute active patient name', () => {
    expect(component).toBeTruthy();
    expect(component.activePatientName()).toContain('Phil Gear');
    expect(component.activeAllergens().length).toBe(3);
    expect(component.isFhirModalOpen()).toBe(false);
  });

  it('should render header with badge and patient name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Dietary Allergy & Additive Shield');
    expect(compiled.textContent).toContain('Red Dye #40 Hypersensitivity');
    expect(compiled.textContent).toContain('Phil Gear');
    expect(compiled.textContent).toContain('FHIR R4 Allergy Bundle');
  });

  it('should render active allergen cards with manifestations and substitutions', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Red Dye #40 (Allura Red AC / E129)');
    expect(compiled.textContent).toContain('PATIENT ALLERGY MATCH');
    expect(compiled.textContent).toContain('Organic Beetroot Anthocyanin Extract');
    expect(compiled.textContent).toContain('Sulfites & Sodium Metabisulfite (E221)');
    expect(compiled.textContent).toContain('Gliadin Gluten Proteins');
    expect(compiled.textContent).toContain('Sprouted Quinoa, Wild Rice');
  });

  it('should open and close the FHIR R4 AllergyIntolerance resource modal', () => {
    component.isFhirModalOpen.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('HL7 FHIR R4 AllergyIntolerance Resource');
    expect(compiled.textContent).toContain('"resourceType": "AllergyIntolerance"');
    expect(compiled.textContent).toContain('Red Dye #40 (Allura Red AC)');

    // Close modal
    component.isFhirModalOpen.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('HL7 FHIR R4 AllergyIntolerance Resource');
  });

  it('should log safety note to PatientStateService when prescribeSafetyNote is called', () => {
    const allergen = component.activeAllergens()[0];
    component.prescribeSafetyNote(allergen);

    expect(addClinicalNoteSpy).toHaveBeenCalled();
    const calledWith = addClinicalNoteSpy.mock.calls[0][0];
    expect(calledWith.text).toContain('Allergen Safety Alert logged');
    expect(calledWith.text).toContain('Red Dye #40');
    expect(calledWith.sourceLens).toBe('Nutrition');
  });
});

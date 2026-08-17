import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Section504FolioComponent } from './section-504-folio.component';
import { Section504AccommodationService } from '../services/section-504-accommodation.service';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';
import { vi } from 'vitest';

describe('Section504FolioComponent', () => {
  let component: Section504FolioComponent;
  let fixture: ComponentFixture<Section504FolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Section504FolioComponent],
      providers: [
        Section504AccommodationService,
        PatientStateService,
        PatientManagementService,
        {
          provide: IntelligenceProviderToken,
          useValue: { generateContent: vi.fn(), generateStream: vi.fn() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Section504FolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Section 504 folio component', () => {
    expect(component).toBeTruthy();
  });

  it('should default to Type 1 Diabetes and render diagnosis & accommodations', () => {
    expect(component.activeCategory()).toBe('type1_diabetes');
    const plan = component.currentPlan();
    expect(plan).toBeDefined();
    expect(plan.primaryDiagnosis).toContain('Type 1 Diabetes');
    expect(plan.accommodations.some(a => a.id === 't1d-cgm')).toBe(true);
  });

  it('should switch categories when selectCategory is called', () => {
    component.selectCategory('pots_dysautonomia');
    fixture.detectChanges();

    expect(component.activeCategory()).toBe('pots_dysautonomia');
    const plan = component.currentPlan();
    expect(plan.primaryDiagnosis).toContain('Postural Orthostatic Tachycardia');
    expect(plan.accommodations.some(a => a.id === 'pots-hydration')).toBe(true);
  });

  it('should contain all 9 pediatric condition options', () => {
    expect(component.conditionOptions.length).toBe(9);
  });
});

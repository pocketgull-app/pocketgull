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

  it('should default to legal_folio view and Type 1 Diabetes', () => {
    expect(component.activeView()).toBe('legal_folio');
    expect(component.activeCategory()).toBe('type1_diabetes');
    const plan = component.currentPlan();
    expect(plan).toBeDefined();
    expect(plan.primaryDiagnosis).toContain('Type 1 Diabetes');
  });

  it('should switch to substitute_card view and compute rapid card metrics', () => {
    component.setViewMode('substitute_card');
    fixture.detectChanges();

    expect(component.activeView()).toBe('substitute_card');
    const card = component.substituteCard();
    expect(card).toBeDefined();
    expect(card.studentName).toBe(component.activeStudentName());
    expect(card.threeKeyRules.length).toBeGreaterThanOrEqual(1);
    expect(card.emergencyActionText).toContain('immediate action');
  });

  it('should switch to courage_badge view and generate courage title and motto', () => {
    component.setViewMode('courage_badge');
    fixture.detectChanges();

    expect(component.activeView()).toBe('courage_badge');
    const badge = component.courageBadge();
    expect(badge).toBeDefined();
    expect(badge.badgeTitle).toContain('Glucose Harmony');
    expect(badge.heroicAttributes.length).toBe(3);
    expect(badge.motto).toContain('Strong cells');
  });
});

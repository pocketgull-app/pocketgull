import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NutritionSuiteComponent } from './nutrition-suite.component';
import { LocalFoodshedOnlineMenuComponent } from '../local-foodshed-online-menu.component';
import { CulinaryClinicalIntelligenceSuiteComponent } from '../culinary-clinical-intelligence-suite.component';
import { ChronoBiomePlateSuiteComponent } from '../chrono-biome-plate-suite.component';
import { PatientStateService } from '../../services/patient-state.service';
import { LocalFoodshedOnlineMenuService } from '../../services/local-foodshed-online-menu.service';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';

describe('NutritionSuiteComponent', () => {
  let fixture: ComponentFixture<NutritionSuiteComponent>;
  let component: NutritionSuiteComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutritionSuiteComponent],
      providers: [
        PatientStateService,
        LocalFoodshedOnlineMenuService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock CDS response'),
            streamContent: vi.fn()
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(NutritionSuiteComponent, {
      set: {
        imports: [CommonModule, LocalFoodshedOnlineMenuComponent, CulinaryClinicalIntelligenceSuiteComponent, ChronoBiomePlateSuiteComponent],
        schemas: [NO_ERRORS_SCHEMA]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionSuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render Nutritional & Metabolic Suite banner', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nutritional & Metabolic Suite');
    expect(el.textContent).toContain('Circadian Nutrition');
  });
});

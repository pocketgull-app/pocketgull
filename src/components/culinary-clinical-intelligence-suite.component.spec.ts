import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CulinaryClinicalIntelligenceSuiteComponent } from './culinary-clinical-intelligence-suite.component';
import { ContinuousMetabolicAutonomicService } from '../services/continuous-metabolic-autonomic.service';
import { KitchenVoiceAlchemistService } from '../services/kitchen-voice-alchemist.service';
import { DrugNutrientInteractionGuardService } from '../services/drug-nutrient-interaction-guard.service';
import { FamilyRecipeHeritageVaultService } from '../services/family-recipe-heritage-vault.service';
import { LocalFoodshedOnlineMenuService } from '../services/local-foodshed-online-menu.service';
import { PatientStateService } from '../services/patient-state.service';

describe('CulinaryClinicalIntelligenceSuiteComponent', () => {
  let component: CulinaryClinicalIntelligenceSuiteComponent;
  let fixture: ComponentFixture<CulinaryClinicalIntelligenceSuiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CulinaryClinicalIntelligenceSuiteComponent],
      providers: [
        ContinuousMetabolicAutonomicService,
        KitchenVoiceAlchemistService,
        DrugNutrientInteractionGuardService,
        FamilyRecipeHeritageVaultService,
        LocalFoodshedOnlineMenuService,
        PatientStateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CulinaryClinicalIntelligenceSuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component with initial CGM & autonomics tab active', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('cgm_autonomics');
  });

  it('should switch across all 5 clinical intelligence tabs', () => {
    component.activeTab.set('voice_companion');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('voice_companion');

    component.activeTab.set('pantry_alchemist');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('pantry_alchemist');

    component.activeTab.set('cyp450_guard');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('cyp450_guard');

    component.activeTab.set('heritage_vault');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('heritage_vault');
  });

  it('should toggle voice listening mode', () => {
    component.toggleVoiceListening();
    expect(component.voiceService.isListening()).toBe(true);
    component.toggleVoiceListening();
    expect(component.voiceService.isListening()).toBe(false);
  });

  it('should formulate recipe from cupboard input', () => {
    component.cupboardInput.set('Organic Lentils, Jasmine Rice, Cumin');
    component.formulateRecipe();
    expect(component.voiceService.formulatedRecipe().title).toContain('Lentil');
  });

  it('should generate and export FHIR R4 Bundle', () => {
    component.exportFhirBundle();
    expect(component.fhirExportMessage()).toContain('HL7 FHIR R4 Bundle');
  });
});

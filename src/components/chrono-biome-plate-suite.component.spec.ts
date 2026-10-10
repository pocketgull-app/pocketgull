import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ChronoBiomePlateSuiteComponent } from './chrono-biome-plate-suite.component';
import { PlateVisionPhotometryService } from '../services/plate-vision-photometry.service';
import { CircadianChronoNutritionService } from '../services/circadian-chrono-nutrition.service';
import { MicrobiomeFermentationVaultService } from '../services/microbiome-fermentation-vault.service';
import { PatientStateService } from '../services/patient-state.service';
import { signal } from '@angular/core';

describe('ChronoBiomePlateSuiteComponent', () => {
  let component: ChronoBiomePlateSuiteComponent;
  let fixture: ComponentFixture<ChronoBiomePlateSuiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChronoBiomePlateSuiteComponent],
      providers: [
        PlateVisionPhotometryService,
        CircadianChronoNutritionService,
        MicrobiomeFermentationVaultService,
        { provide: PatientStateService, useValue: { anatomyViewMode: signal('standard') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChronoBiomePlateSuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and default to plate_vision tab', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('plate_vision');
  });

  it('should switch tabs between plate vision, chrono nutrition, and microbiome vault', () => {
    component.activeTab.set('circadian_chrono');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('circadian_chrono');

    component.activeTab.set('microbiome_vault');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('microbiome_vault');
  });

  it('should trigger plate vision scan', () => {
    component.triggerNewPlateScan();
    expect(component.plateVisionService.isProcessing()).toBe(true);
  });
});

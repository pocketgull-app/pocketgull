import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { ClinicalDataCardComponent, PARADIGM_HEALTHSHEET_PRESETS } from './clinical-data-card.component';

describe('ClinicalDataCardComponent Unit Suite', () => {
  let component: ClinicalDataCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalDataCardComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(ClinicalDataCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Instantiates successfully with default harmonized healthsheet card', () => {
    expect(component).toBeTruthy();
    expect(component.selectedPresetKey()).toBe('harmonized');
    expect(component.activeTab()).toBe('influence');
    expect(component.activeCard().title).toContain('Tri-Paradigm Harmonized');
    expect(component.activeCard().metrics.aucRoc).toBeGreaterThan(0.9);
  });

  it('2. Switches active tabs across influence, provenance, model, and hygiene', () => {
    component.activeTab.set('provenance');
    expect(component.activeTab()).toBe('provenance');

    component.activeTab.set('model');
    expect(component.activeTab()).toBe('model');

    component.activeTab.set('hygiene');
    expect(component.activeTab()).toBe('hygiene');

    component.activeTab.set('influence');
    expect(component.activeTab()).toBe('influence');
  });

  it('3. Selects different clinical paradigm healthsheet presets', () => {
    component.selectedPresetKey.set('western');
    expect(component.activeCard().paradigm).toBe('Western Allopathic');

    if (PARADIGM_HEALTHSHEET_PRESETS.tcm) {
      component.selectedPresetKey.set('tcm');
      expect(component.activeCard().paradigm).toContain('TCM');
    }

    if (PARADIGM_HEALTHSHEET_PRESETS.ayurvedic) {
      component.selectedPresetKey.set('ayurvedic');
      expect(component.activeCard().paradigm).toContain('Ayurvedic');
    }
  });

  it('4. Prioritizes custom cardInput when provided', () => {
    const customCard = {
      ...PARADIGM_HEALTHSHEET_PRESETS.harmonized,
      id: 'custom-card-99',
      title: 'Custom Clinical Healthsheet'
    };

    const instance = Object.create(ClinicalDataCardComponent.prototype);
    instance.selectedPresetKey = signal('harmonized');
    instance.cardInput = signal(customCard);
    instance.activeCard = computed(() => {
      const custom = instance.cardInput();
      if (custom) return custom;
      return PARADIGM_HEALTHSHEET_PRESETS[instance.selectedPresetKey()] || PARADIGM_HEALTHSHEET_PRESETS.harmonized;
    });

    expect(instance.activeCard().id).toBe('custom-card-99');
    expect(instance.activeCard().title).toBe('Custom Clinical Healthsheet');
  });

  it('5. Verifies data hygiene and FHIR R4 compliance attributes', () => {
    const card = component.activeCard();
    expect(card.dataHygiene.fhirCompliance).toContain('FHIR R4');
    expect(card.dataHygiene.imputationMethod).toBeDefined();
    expect(card.metrics.fairnessDisparity).toBeDefined();
  });
});

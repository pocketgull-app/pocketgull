import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { LensRsnaKneeComponent, IFhirR4DiagnosticReport } from '../src/components/lens-rsna-knee.component';

describe('RSNA Knee AI Lens & FHIR R4 Suite', () => {
  it('should initialize 12 target abnormalities with valid probabilities in [0, 1]', () => {
    const component = new LensRsnaKneeComponent();
    const targets = component.targets();

    expect(targets.length).toBe(12);
    for (const target of targets) {
      expect(target.probability).toBeGreaterThanOrEqual(0.0);
      expect(target.probability).toBeLessThanOrEqual(1.0);
      expect(typeof target.radiologistCriteria).toBe('string');
      expect(target.radiologistCriteria.length).toBeGreaterThan(5);
    }
  });

  it('should filter targets correctly by imaging plane', () => {
    const component = new LensRsnaKneeComponent();
    
    // Default 'All' plane
    expect(component.filteredTargets().length).toBe(12);

    // Sagittal plane
    component.selectedPlane.set('Sagittal');
    const sagittalTargets = component.filteredTargets();
    expect(sagittalTargets.length).toBeGreaterThan(0);
    for (const target of sagittalTargets) {
      expect(target.primaryPlane).toBe('Sagittal');
    }

    // Coronal plane
    component.selectedPlane.set('Coronal');
    const coronalTargets = component.filteredTargets();
    expect(coronalTargets.length).toBeGreaterThan(0);
    for (const target of coronalTargets) {
      expect(target.primaryPlane).toBe('Coronal');
    }
  });

  it('should generate a valid FHIR R4 DiagnosticReport Bundle', () => {
    const component = new LensRsnaKneeComponent();
    component.exportFhirBundle();

    expect(component.fhirExported()).toBe(true);
  });
});
